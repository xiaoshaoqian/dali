"""Alibaba Cloud OSS integration for image storage.

Used for image storage with SSE encryption.
"""

from datetime import datetime, timedelta

import oss2

from app.config import settings


class OSSClient:
    """Client for Alibaba Cloud OSS operations."""

    def __init__(self) -> None:
        """Initialize OSS client with credentials from settings."""
        self._auth = oss2.Auth(
            settings.ALIBABA_ACCESS_KEY_ID,
            settings.ALIBABA_ACCESS_KEY_SECRET,
        )
        self._bucket = oss2.Bucket(
            self._auth,
            settings.ALIBABA_OSS_ENDPOINT,
            settings.ALIBABA_OSS_BUCKET,
        )

    def generate_presigned_upload_url(
        self,
        object_key: str,
        expires: int = 600,
        content_type: str = "image/jpeg",
    ) -> str:
        """Generate a presigned URL for uploading an object.

        Args:
            object_key: The object key (path) in OSS
            expires: URL expiration time in seconds (default: 600 = 10 minutes)
            content_type: MIME type of the file

        Returns:
            Presigned upload URL
        """
        # Generate presigned URL for PUT operation
        url = self._bucket.sign_url(
            "PUT",
            object_key,
            expires,
            headers={"Content-Type": content_type},
        )
        return url

    def generate_presigned_download_url(
        self,
        object_key: str,
        expires: int = 3600,
    ) -> str:
        """Generate a presigned URL for downloading an object.

        Args:
            object_key: The object key (path) in OSS
            expires: URL expiration time in seconds (default: 3600 = 1 hour)

        Returns:
            Presigned download URL
        """
        url = self._bucket.sign_url("GET", object_key, expires)
        return url

    def get_public_url(self, object_key: str) -> str:
        """Get the public URL for an object (if bucket is public).

        Args:
            object_key: The object key (path) in OSS

        Returns:
            Public URL to access the file
        """
        # For private buckets, you should use presigned URLs instead
        # This returns the base URL format
        return f"https://{settings.ALIBABA_OSS_BUCKET}.{settings.ALIBABA_OSS_ENDPOINT}/{object_key}"

    def delete_object(self, object_key: str) -> bool:
        """Delete an object from OSS.

        Args:
            object_key: The object key (path) to delete

        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            self._bucket.delete_object(object_key)
            return True
        except oss2.exceptions.OssError:
            return False

    def list_objects(self, prefix: str = "", max_keys: int = 100) -> list[str]:
        """List objects with a given prefix.

        Args:
            prefix: The prefix to filter objects
            max_keys: Maximum number of objects to return

        Returns:
            List of object keys
        """
        try:
            result = self._bucket.list_objects(prefix=prefix, max_keys=max_keys)
            return [obj.key for obj in result.object_list]
        except oss2.exceptions.OssError:
            return []

    def object_exists(self, object_key: str) -> bool:
        """Check if an object exists in OSS.

        Args:
            object_key: The object key (path) to check

        Returns:
            True if object exists, False otherwise
        """
        return self._bucket.object_exists(object_key)


# Singleton instance
oss_client = OSSClient()
