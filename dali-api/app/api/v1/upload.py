"""Upload API routes for photo upload functionality."""

import logging
from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, Query

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.upload import SignedUrlRequest, SignedUrlResponse
from app.services.storage import storage_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/signed-url", response_model=SignedUrlResponse)
async def get_signed_upload_url(
    request: SignedUrlRequest,
    current_user: User = Depends(get_current_user),
) -> SignedUrlResponse:
    """
    Generate a presigned URL for uploading a photo to cloud storage.

    The URL expires after 10 minutes.
    """
    # Generate unique object key
    timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
    unique_id = uuid4().hex[:8]
    extension = request.content_type.split("/")[-1] if "/" in request.content_type else "jpg"
    object_key = f"users/{current_user.id}/photos/{timestamp}_{unique_id}.{extension}"

    # Generate presigned URL
    signed_url, expires_at = storage_service.generate_upload_url(
        object_key=object_key,
        content_type=request.content_type,
        expiry_minutes=10,
    )

    # Generate the final URL where the photo will be accessible
    photo_url = storage_service.get_file_url(object_key)
    
    # Debug logging
    logger.info(f"Generated upload URL for object_key: {object_key}")
    logger.info(f"Photo URL (signed): {photo_url[:100]}..." if len(photo_url) > 100 else f"Photo URL: {photo_url}")

    return SignedUrlResponse(
        uploadUrl=signed_url,
        objectKey=object_key,
        photoUrl=photo_url,
        expiresAt=expires_at,
    )


@router.get("/refresh-url")
async def refresh_photo_url(
    object_key: str = Query(..., description="Object key of the photo"),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Refresh the signed URL for an existing photo.
    
    Use this when the previous signed URL has expired.
    Returns a new signed URL with 1 hour expiry.
    """
    # Verify the object key belongs to this user
    expected_prefix = f"users/{current_user.id}/"
    if not object_key.startswith(expected_prefix):
        logger.warning(f"User {current_user.id} attempted to access object: {object_key}")
        return {"error": "Access denied", "photoUrl": None}
    
    # Generate fresh signed URL
    photo_url = storage_service.get_file_url(object_key)
    
    logger.info(f"Refreshed URL for object_key: {object_key}")
    
    return {
        "objectKey": object_key,
        "photoUrl": photo_url,
    }
