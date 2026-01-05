"""Cloud storage service for photo uploads.

This module provides a mock implementation of cloud storage functionality.
In production, this would integrate with Alibaba Cloud OSS.
"""

from datetime import UTC, datetime, timedelta

from app.config import settings


class StorageService:
    """Storage service for managing file uploads.

    Currently implements a mock storage solution.
    Production implementation would use Alibaba Cloud OSS SDK.
    """

    def __init__(self) -> None:
        """Initialize storage service."""
        # In production, this would be the OSS bucket URL
        self.base_url = settings.OSS_BASE_URL if hasattr(settings, "OSS_BASE_URL") else "https://dali-storage.oss-cn-hangzhou.aliyuncs.com"

    def generate_upload_url(
        self,
        object_key: str,
        content_type: str = "image/jpeg",
        expiry_minutes: int = 10,
    ) -> tuple[str, datetime]:
        """
        Generate a presigned URL for uploading a file.

        In production, this would use OSS SDK to generate a real presigned URL.
        For now, returns a mock URL that points to the storage endpoint.

        Args:
            object_key: The object key (path) in storage
            content_type: MIME type of the file
            expiry_minutes: URL expiration time in minutes

        Returns:
            Tuple of (upload_url, expiry_datetime)
        """
        # Calculate expiry time
        expires_at = datetime.now(UTC) + timedelta(minutes=expiry_minutes)

        # Mock presigned URL (in production, use OSS SDK)
        # Format: base_url/object_key?signature=xxx&expires=xxx
        mock_signature = "mock_signature_for_development"
        expires_timestamp = int(expires_at.timestamp())
        upload_url = f"{self.base_url}/{object_key}?signature={mock_signature}&expires={expires_timestamp}&content-type={content_type}"

        return upload_url, expires_at

    def get_file_url(self, object_key: str) -> str:
        """
        Get the public URL for an uploaded file.

        Args:
            object_key: The object key (path) in storage

        Returns:
            Public URL to access the file
        """
        return f"{self.base_url}/{object_key}"

    def delete_file(self, object_key: str) -> bool:
        """
        Delete a file from storage.

        Args:
            object_key: The object key (path) to delete

        Returns:
            True if deletion was successful, False otherwise
        """
        # Mock implementation - always returns True
        # In production, this would call OSS SDK to delete the file
        return True


# Singleton instance
storage_service = StorageService()
