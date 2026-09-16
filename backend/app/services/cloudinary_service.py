"""
Cloudinary Image Storage Service.
Handles secure upload and deletion of user profile avatars using Cloudinary Python SDK.
"""

import logging
from typing import Dict, Tuple
import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile, status

from app.config import settings

logger = logging.getLogger("scamshield.cloudinary")

# Max allowed avatar image size: 5 Megabytes
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


def _init_cloudinary() -> None:
    """Initializes Cloudinary credentials from configuration."""
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )


def validate_image_file(file: UploadFile) -> None:
    """
    Validates MIME type and content length of uploaded image file.
    """
    if not file.content_type or file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image format. Allowed formats: JPEG, PNG, WEBP.",
        )

    # Check size by reading buffer
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)

    if size > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Image size exceeds maximum limit of 5MB.",
        )


def upload_profile_photo(file: UploadFile, user_id: int) -> Dict[str, str]:
    """
    Uploads user avatar image to Cloudinary and returns the secure URL and public ID.
    """
    validate_image_file(file)
    _init_cloudinary()

    try:
        folder_path = "scamshield/avatars"
        result = cloudinary.uploader.upload(
            file.file,
            folder=folder_path,
            public_id=f"user_{user_id}",
            overwrite=True,
            resource_type="image",
            transformation=[
                {"width": 300, "height": 300, "crop": "fill", "gravity": "face"},
                {"quality": "auto"},
                {"fetch_format": "auto"}
            ]
        )
        return {
            "url": result.get("secure_url", ""),
            "public_id": result.get("public_id", ""),
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Cloudinary upload failed for user %s: %s", user_id, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image. Please try again later.",
        ) from None


def delete_profile_photo(public_id: str) -> bool:
    """
    Deletes an avatar image from Cloudinary by its public ID.
    """
    if not public_id:
        return True
    _init_cloudinary()
    try:
        response = cloudinary.uploader.destroy(public_id, resource_type="image")
        return response.get("result") in ("ok", "not found")
    except Exception as exc:
        logger.error("Cloudinary deletion failed for public_id %s: %s", public_id, exc, exc_info=True)
        return False
