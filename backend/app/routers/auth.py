"""
Authentication and User Profile Router.
Handles registration, login, logout, current user profile, and Cloudinary avatar management.
"""

import logging
from typing import Dict
from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import (
    UserLoginRequest,
    UserProfileUpdateRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.auth_service import (
    clear_auth_cookie,
    create_access_token,
    get_current_user,
    hash_password,
    set_auth_cookie,
    verify_password,
)
from app.services.cloudinary_service import delete_profile_photo, upload_profile_photo

logger = logging.getLogger("scamshield.auth_router")

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


def _format_user(user: User) -> UserResponse:
    """Formats SQLAlchemy User model into safe UserResponse schema."""
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        profile_photo=user.profile_photo,
        created_at=user.created_at.isoformat() if user.created_at else "",
        updated_at=user.updated_at.isoformat() if user.updated_at else "",
    )


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register_user(
    request: UserRegisterRequest,
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Creates a new user account with hashed password in PostgreSQL.
    Rejects duplicate email with HTTP 409 Conflict.
    Profile photo is optional and not required during registration.
    """
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    pwd_hash = hash_password(request.password)
    user = User(
        name=request.name,
        email=request.email,
        password_hash=pwd_hash,
        profile_photo=None,
        profile_photo_public_id=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    logger.info("Registered new user with id=%s email=%s", user.id, user.email)
    return _format_user(user)


@router.post(
    "/login",
    response_model=UserResponse,
    summary="Authenticate user and set HTTP-only JWT cookie",
)
def login_user(
    request: UserLoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Validates user credentials, generates a signed JWT, sets the HTTP-only cookie,
    and returns safe user profile data (never exposing the raw token or password hash).
    """
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(user.id)
    set_auth_cookie(response, token)

    logger.info("User logged in id=%s email=%s", user.id, user.email)
    return _format_user(user)


@router.post(
    "/logout",
    summary="Log out user and clear authentication cookie",
)
def logout_user(response: Response) -> Dict[str, str]:
    """
    Clears the access_token HTTP-only cookie.
    """
    clear_auth_cookie(response)
    return {"message": "Logged out successfully."}


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user profile",
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Reads the JWT from the HTTP-only cookie and returns the current user profile.
    """
    return _format_user(current_user)


@router.put(
    "/profile",
    response_model=UserResponse,
    summary="Update current user profile information",
)
def update_profile(
    request: UserProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Updates the authenticated user's display name.
    """
    current_user.name = request.name
    db.commit()
    db.refresh(current_user)
    return _format_user(current_user)


@router.post(
    "/profile-photo",
    response_model=UserResponse,
    summary="Upload or update user profile avatar to Cloudinary",
)
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Uploads an image (JPEG, PNG, WEBP max 5MB) via multipart/form-data to Cloudinary.
    Removes any previously stored avatar asset and stores the new secure URL and public_id.
    """
    old_public_id = current_user.profile_photo_public_id

    result = upload_profile_photo(file, current_user.id)

    # If new photo uploaded successfully, clean up previous Cloudinary asset
    if old_public_id and old_public_id != result["public_id"]:
        delete_profile_photo(old_public_id)

    current_user.profile_photo = result["url"]
    current_user.profile_photo_public_id = result["public_id"]
    db.commit()
    db.refresh(current_user)

    logger.info("Updated profile photo for user id=%s", current_user.id)
    return _format_user(current_user)


@router.delete(
    "/profile-photo",
    response_model=UserResponse,
    summary="Delete user profile avatar from Cloudinary",
)
def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Removes the avatar from Cloudinary and resets the profile_photo field to NULL.
    """
    if current_user.profile_photo_public_id:
        delete_profile_photo(current_user.profile_photo_public_id)

    current_user.profile_photo = None
    current_user.profile_photo_public_id = None
    db.commit()
    db.refresh(current_user)

    logger.info("Deleted profile photo for user id=%s", current_user.id)
    return _format_user(current_user)
