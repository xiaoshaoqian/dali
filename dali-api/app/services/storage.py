"""Cloud storage service for photo uploads.

This module provides both real OSS and mock storage implementations.
Use real OSS when credentials are configured, otherwise falls back to mock.
"""

import logging
from datetime import UTC, datetime, timedelta

from app.config import settings

logger = logging.getLogger(__name__)


class StorageService:
    """Storage service for managing file uploads.

    Automatically uses real OSS if credentials are configured,
    otherwise uses mock implementation for development.
    """

    def __init__(self) -> None:
        """Initialize storage service."""
        self._use_real_oss = self._should_use_real_oss()

        if self._use_real_oss:
            # Import and initialize real OSS client
            from app.integrations.alibaba_oss import oss_client
            self._oss_client = oss_client
            self.base_url = f"https://{settings.ALIBABA_OSS_BUCKET}.{settings.ALIBABA_OSS_ENDPOINT}"
        else:
            # Use mock implementation
            self._oss_client = None
            self.base_url = "https://dali-storage.oss-cn-hangzhou.aliyuncs.com"

    def _should_use_real_oss(self) -> bool:
        """Check if real OSS should be used based on configuration."""
        return bool(
            settings.ALIBABA_ACCESS_KEY_ID
            and settings.ALIBABA_ACCESS_KEY_SECRET
            and settings.ALIBABA_OSS_BUCKET
            and settings.ALIBABA_OSS_ENDPOINT
        )

    def generate_upload_url(
        self,
        object_key: str,
        content_type: str = "image/jpeg",
        expiry_minutes: int = 10,
    ) -> tuple[str, datetime]:
        """
        Generate a presigned URL for uploading a file.

        Uses real OSS if configured, otherwise returns mock URL.

        Args:
            object_key: The object key (path) in storage
            content_type: MIME type of the file
            expiry_minutes: URL expiration time in minutes

        Returns:
            Tuple of (upload_url, expiry_datetime)
        """
        expires_at = datetime.now(UTC) + timedelta(minutes=expiry_minutes)

        if self._use_real_oss:
            # Generate real presigned URL
            upload_url = self._oss_client.generate_presigned_upload_url(
                object_key=object_key,
                expires=expiry_minutes * 60,  # Convert to seconds
                content_type=content_type,
            )
        else:
            # Mock presigned URL for development
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
        if self._use_real_oss:
            url = self._oss_client.get_public_url(object_key)
            # Log URL info (first 150 chars to avoid exposing full signature)
            logger.info(f"[StorageService] Generated signed URL for {object_key}")
            logger.info(f"[StorageService] URL preview: {url[:150]}..." if len(url) > 150 else f"[StorageService] URL: {url}")
            if "Signature=" in url or "signature" in url.lower():
                logger.info("[StorageService] ✅ URL contains signature")
            else:
                logger.warning("[StorageService] ⚠️ URL does NOT contain signature!")
            return url
        else:
            url = f"{self.base_url}/{object_key}"
            logger.info(f"[StorageService] Mock URL (no real OSS): {url}")
            return url

    def delete_file(self, object_key: str) -> bool:
        """
        Delete a file from storage.

        Args:
            object_key: The object key (path) to delete

        Returns:
            True if deletion was successful, False otherwise
        """
        if self._use_real_oss:
            return self._oss_client.delete_object(object_key)
        else:
            # Mock implementation - always returns True
            return True


# Singleton instance
storage_service = StorageService()
