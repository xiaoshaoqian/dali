"""Upload schemas for photo upload functionality."""

from datetime import datetime

from pydantic import BaseModel, Field


class SignedUrlRequest(BaseModel):
    """Request schema for generating signed upload URL."""

    content_type: str = Field(
        default="image/jpeg",
        description="MIME type of the file to upload",
        pattern=r"^image/(jpeg|png|webp)$",
    )


class SignedUrlResponse(BaseModel):
    """Response schema with signed URL for file upload."""

    uploadUrl: str = Field(..., description="Presigned URL for uploading the file")
    objectKey: str = Field(..., description="Object key in cloud storage")
    photoUrl: str = Field(..., description="Final URL where the photo will be accessible")
    expiresAt: datetime = Field(..., description="URL expiration timestamp")
