"""
Authentication and Authorization Service Module.
Handles password hashing, JWT generation/validation, HTTP-only cookie management,
and FastAPI user dependencies.
"""

from datetime import datetime, timedelta, timezone
import logging
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, Request, Response, status
import jwt
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User

logger = logging.getLogger("scamshield.auth")


def hash_password(password: str) -> str:
    """
    Hashes a plain-text password using bcrypt with a generated salt.
    """
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verifies a plain-text password against a stored bcrypt hash.
    """
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            password_hash.encode("utf-8")
        )
    except Exception as exc:
        logger.warning("Password verification failure: %s", exc)
        return False


def create_access_token(user_id: int) -> str:
    """
    Generates a signed JWT containing the user ID subject and expiration claim.
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> Optional[int]:
    """
    Decodes and validates a signed JWT token, returning the user ID if valid.
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        sub = payload.get("sub")
        if sub is None:
            return None
        return int(sub)
    except (jwt.PyJWTError, ValueError, TypeError) as exc:
        logger.debug("JWT decode rejected: %s", exc)
        return None


def set_auth_cookie(response: Response, token: str) -> None:
    """
    Sets the access_token cookie as HTTP-only with security configurations.
    """
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        max_age=settings.access_token_expire_minutes * 60,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    """
    Clears the access_token HTTP-only cookie upon logout.
    """
    response.delete_cookie(
        key=settings.cookie_name,
        path="/",
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """
    FastAPI dependency for protected endpoints.
    Reads the JWT from the HTTP-only cookie, validates expiration and signature,
    and returns the authenticated User record from PostgreSQL.
    Raises HTTP 401 if missing or invalid.
    """
    token = request.cookies.get(settings.cookie_name)
    if not token:
        # Fallback to Authorization header if provided (e.g. bearer token)
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
        )

    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or is invalid. Please log in again.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
        )

    return user


def get_optional_current_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """
    FastAPI dependency for public endpoints with optional user tracking.
    Extracts the authenticated User if a valid cookie is present.
    Returns None if unauthenticated without raising an error.
    """
    token = request.cookies.get(settings.cookie_name)
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()

    if not token:
        return None

    user_id = decode_access_token(token)
    if user_id is None:
        return None

    try:
        return db.query(User).filter(User.id == user_id).first()
    except Exception as exc:
        logger.warning("Optional user lookup error: %s", exc)
        return None
