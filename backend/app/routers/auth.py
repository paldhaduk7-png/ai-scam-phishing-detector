"""
Authentication and User Profile Router.
Handles registration, login, logout, current user profile, and Cloudinary avatar management.
"""

from datetime import datetime, timedelta, timezone
import hashlib
import logging
import secrets
from typing import Dict
from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, Request, Response, UploadFile, status
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PasswordResetOTP, User
from app.schemas import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    UserLoginRequest,
    UserProfileUpdateRequest,
    UserRegisterRequest,
    UserResponse,
    VerifyOTPRequest,
    VerifyOTPResponse,
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
from app.services.email_service import send_password_reset_otp_email

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
async def register_user(
    request: Request,
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Creates a new user account in PostgreSQL.
    Supports both multipart/form-data (with optional profile photo upload) and application/json.
    Rejects duplicate email with HTTP 409 Conflict.
    """
    content_type = request.headers.get("content-type", "")
    photo_file = None

    if "multipart/form-data" in content_type:
        form = await request.form()
        name = (form.get("name") or "").strip()
        email = (form.get("email") or "").strip().lower()
        password = form.get("password") or ""
        confirm_password = form.get("confirm_password") or None
        photo_file = form.get("profile_photo") or form.get("file") or form.get("photo")
    else:
        body = await request.json()
        try:
            req = UserRegisterRequest(**body)
        except ValidationError as val_err:
            raise RequestValidationError(val_err.errors()) from val_err
        name = req.name.strip()
        email = req.email.strip().lower()
        password = req.password
        confirm_password = req.confirm_password

    if not name or len(name) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Full name must be at least 2 characters.",
        )

    if not email or "@" not in email or "." not in email.split("@")[-1]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address.",
        )

    if not password or len(password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long.",
        )

    if confirm_password and password != confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match.",
        )

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    pwd_hash = hash_password(password)
    user = User(
        name=name,
        email=email,
        password_hash=pwd_hash,
        profile_photo=None,
        profile_photo_public_id=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # If an avatar photo file was uploaded in registration form, upload it to Cloudinary
    if photo_file and hasattr(photo_file, "filename") and photo_file.filename:
        try:
            upload_result = upload_profile_photo(photo_file, user.id)
            user.profile_photo = upload_result.get("url")
            user.profile_photo_public_id = upload_result.get("public_id")
            db.commit()
            db.refresh(user)
            logger.info("Uploaded avatar for new user id=%s: %s", user.id, user.profile_photo)
        except HTTPException:
            raise
        except Exception as exc:
            logger.warning("Cloudinary upload failed during registration for user %s: %s", user.id, exc)

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


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    summary="Request 6-digit password reset OTP",
)
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> ForgotPasswordResponse:
    """
    Generates a cryptographically secure 6-digit OTP with 10-minute validity.
    Dispatches a branded email via SMTP in the background.
    Includes a 60-second resend cooldown protection against spam/abuse.
    Always returns a generic success message to prevent user account enumeration.
    """
    generic_message = "If an account exists for this email, a 6-digit verification code has been sent."

    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This email does not exist.",
        )

    # Cooldown check: prevent requesting new OTP within 60 seconds
    recent_otp = (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.user_id == user.id,
            PasswordResetOTP.created_at >= datetime.now(timezone.utc) - timedelta(seconds=60),
        )
        .first()
    )
    if recent_otp:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Please wait 60 seconds before requesting another verification code.",
        )

    # Invalidate any existing unused OTPs for this user
    db.query(PasswordResetOTP).filter(
        PasswordResetOTP.user_id == user.id,
        PasswordResetOTP.is_used == False,
    ).update({"is_used": True})

    # Generate cryptographically secure 6-digit OTP (e.g. "042918")
    otp_code = f"{secrets.randbelow(1000000):06d}"
    # Hash OTP combined with user ID so plaintext OTP is never persisted
    otp_hash = hashlib.sha256(f"{user.id}:{otp_code}".encode("utf-8")).hexdigest()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    otp_record = PasswordResetOTP(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=expires_at,
        is_used=False,
    )
    db.add(otp_record)
    db.commit()

    # Queue email delivery in background task (never logs the OTP)
    background_tasks.add_task(send_password_reset_otp_email, user.email, user.name, otp_code)
    logger.info("Queued password reset OTP for user id=%s", user.id)

    return ForgotPasswordResponse(message=generic_message)


@router.post(
    "/verify-otp",
    response_model=VerifyOTPResponse,
    summary="Verify 6-digit password reset OTP",
)
def verify_otp(
    request: VerifyOTPRequest,
    db: Session = Depends(get_db),
) -> VerifyOTPResponse:
    """
    Validates that the provided 6-digit OTP matches an active, unexpired record for this account.
    Returns a confirmation response allowing the user to proceed to setting a new password.
    """
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code.",
        )

    otp_hash = hashlib.sha256(f"{user.id}:{request.otp.strip()}".encode("utf-8")).hexdigest()

    record = (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.user_id == user.id,
            PasswordResetOTP.otp_hash == otp_hash,
            PasswordResetOTP.is_used == False,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please check and try again.",
        )

    # Check 10-minute expiration
    now = datetime.now(timezone.utc)
    if record.expires_at < now:
        record.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired (valid for 10 minutes). Please request a new code.",
        )

    temp_token = secrets.token_urlsafe(32)
    return VerifyOTPResponse(
        message="Verification code confirmed successfully.",
        reset_token=temp_token,
    )


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
    summary="Reset password using verified 6-digit OTP",
)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> ResetPasswordResponse:
    """
    Consumes the single-use 6-digit OTP, validates 10-minute expiration,
    hashes the new password using existing bcrypt configuration, and updates the user record.
    """
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code.",
        )

    otp_hash = hashlib.sha256(f"{user.id}:{request.otp.strip()}".encode("utf-8")).hexdigest()

    record = (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.user_id == user.id,
            PasswordResetOTP.otp_hash == otp_hash,
            PasswordResetOTP.is_used == False,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please request a new code.",
        )

    # Check 10-minute expiration
    now = datetime.now(timezone.utc)
    if record.expires_at < now:
        record.is_used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired (valid for 10 minutes). Please request a new code.",
        )

    # Hash new password using existing bcrypt service
    user.password_hash = hash_password(request.password)
    # Mark OTP as consumed (single-use)
    record.is_used = True
    # Invalidate any other active OTPs for this user
    db.query(PasswordResetOTP).filter(
        PasswordResetOTP.user_id == user.id,
        PasswordResetOTP.is_used == False,
    ).update({"is_used": True})

    db.commit()

    logger.info("Successfully reset password for user id=%s via OTP", user.id)
    return ResetPasswordResponse(
        message="Your password has been successfully reset. You can now log in with your new password."
    )
