"""Alibaba Cloud OSS integration for image storage.

Used for image storage with SSE encryption.
"""

from datetime import datetime, timedelta
from urllib.parse import quote, unquote, urlsplit, urlunsplit

import oss2

from app.config import settings


def encode_presigned_url(url: str) -> str:
    """Encode query parameter values in a presigned URL without mangling '+'.

    OSS sign_url may return Signature with '+' and '/' unescaped. If we use
    parse_qs/parse_qsl, '+' becomes space, breaking the signature. This function:
    - splits the raw query manually
    - percent-encodes each value using quote()
    - preserves existing percent-encoded sequences
    """
    parts = urlsplit(url)
    if not parts.query:
        return url

    encoded_params: list[str] = []
    for pair in parts.query.split("&"):
        if not pair:
            continue
        if "=" in pair:
            key, value = pair.split("=", 1)
        else:
            key, value = pair, ""
        # unquote (NOT unquote_plus) to avoid treating '+' as space
        decoded_value = unquote(value)
        encoded_value = quote(decoded_value, safe="")
        encoded_params.append(f"{key}={encoded_value}")

    encoded_query = "&".join(encoded_params)
    return urlunsplit((
        parts.scheme,
        parts.netloc,
        parts.path,
        encoded_query,
        parts.fragment,
    ))


class OSSClient:
    """Client for Alibaba Cloud OSS operations."""

    def __init__(self) -> None:
        """Initialize OSS client with credentials from settings."""
        self._auth = oss2.Auth(
            settings.ALIBABA_ACCESS_KEY_ID,
            settings.ALIBABA_ACCESS_KEY_SECRET,
        )
        
        # Ensure endpoint uses HTTPS (required for bucket policy)
        endpoint = settings.ALIBABA_OSS_ENDPOINT
        if not endpoint.startswith("http://") and not endpoint.startswith("https://"):
            endpoint = f"https://{endpoint}"
        elif endpoint.startswith("http://"):
            # Force HTTPS
            endpoint = endpoint.replace("http://", "https://", 1)
        
        self._bucket = oss2.Bucket(
            self._auth,
            endpoint,
            settings.ALIBABA_OSS_BUCKET,
        )

    def _encode_presigned_url(self, url: str) -> str:
        """Ensure presigned URL parameters are properly URL-encoded."""
        return encode_presigned_url(url)

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
            Presigned upload URL with properly encoded signature
        """
        # Generate presigned URL for PUT operation
        url = self._bucket.sign_url(
            "PUT",
            object_key,
            expires,
            headers={"Content-Type": content_type},
        )
        # Return URL as-is from OSS SDK (already properly encoded)
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
            Presigned download URL with properly encoded signature
        """
        url = self._bucket.sign_url("GET", object_key, expires)
        # Return URL as-is from OSS SDK (already properly encoded)
        return url

    def get_public_url(self, object_key: str) -> str:
        """Get the accessible URL for an object.

        For private buckets, returns a presigned URL with 1 hour expiry.
        For public buckets, returns the direct URL.

        Args:
            object_key: The object key (path) in OSS

        Returns:
            URL to access the file
        """
        # Use presigned URL to ensure accessibility for private buckets
        return self.generate_presigned_download_url(object_key, expires=3600)

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
