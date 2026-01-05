"""Upload API routes for photo upload functionality."""

from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.upload import SignedUrlRequest, SignedUrlResponse
from app.services.storage import storage_service

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

    # Generate presigned URL (mock for now)
    signed_url, expires_at = storage_service.generate_upload_url(
        object_key=object_key,
        content_type=request.content_type,
        expiry_minutes=10,
    )

    # Generate the final URL where the photo will be accessible
    photo_url = storage_service.get_file_url(object_key)

    return SignedUrlResponse(
        uploadUrl=signed_url,
        objectKey=object_key,
        photoUrl=photo_url,
        expiresAt=expires_at,
    )
