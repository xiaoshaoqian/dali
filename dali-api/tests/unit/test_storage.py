"""Unit tests for storage service.

Tests:
- Signed URL generation
- File URL generation
- File deletion
"""

from datetime import UTC, datetime, timedelta

from app.services.storage import StorageService, storage_service


class TestStorageService:
    """Tests for StorageService class."""

    def test_storage_service_singleton(self) -> None:
        """Test that storage_service is a singleton instance."""
        assert storage_service is not None
        assert isinstance(storage_service, StorageService)

    def test_generate_upload_url_returns_tuple(self) -> None:
        """Test that generate_upload_url returns (url, expiry) tuple."""
        result = storage_service.generate_upload_url(
            object_key="test/photo.jpg",
            content_type="image/jpeg",
            expiry_minutes=10,
        )
        assert isinstance(result, tuple)
        assert len(result) == 2

    def test_generate_upload_url_contains_object_key(self) -> None:
        """Test that generated URL contains the object key."""
        object_key = "users/123/photos/test.jpg"
        url, _ = storage_service.generate_upload_url(
            object_key=object_key,
            content_type="image/jpeg",
        )
        assert object_key in url

    def test_generate_upload_url_contains_content_type(self) -> None:
        """Test that generated URL contains content type."""
        content_type = "image/png"
        url, _ = storage_service.generate_upload_url(
            object_key="test.png",
            content_type=content_type,
        )
        assert content_type in url or "content-type" in url.lower()

    def test_generate_upload_url_expiry_time(self) -> None:
        """Test that expiry time is correctly calculated."""
        expiry_minutes = 15
        before = datetime.now(UTC)
        _, expires_at = storage_service.generate_upload_url(
            object_key="test.jpg",
            expiry_minutes=expiry_minutes,
        )
        after = datetime.now(UTC)

        # Expiry should be between (before + expiry_minutes) and (after + expiry_minutes)
        expected_min = before + timedelta(minutes=expiry_minutes)
        expected_max = after + timedelta(minutes=expiry_minutes)

        assert expected_min <= expires_at <= expected_max

    def test_generate_upload_url_default_expiry(self) -> None:
        """Test default expiry is 10 minutes."""
        before = datetime.now(UTC)
        _, expires_at = storage_service.generate_upload_url(object_key="test.jpg")

        # Should be approximately 10 minutes from now
        expected = before + timedelta(minutes=10)
        # Allow 1 second tolerance
        assert abs((expires_at - expected).total_seconds()) < 1

    def test_get_file_url(self) -> None:
        """Test get_file_url returns correct URL."""
        object_key = "users/abc/photos/image.jpg"
        url = storage_service.get_file_url(object_key)

        assert object_key in url
        assert url.startswith("http")

    def test_get_file_url_no_query_params(self) -> None:
        """Test get_file_url returns URL without query parameters."""
        url = storage_service.get_file_url("test.jpg")
        assert "?" not in url  # Should be a clean URL

    def test_delete_file(self) -> None:
        """Test delete_file returns True (mock implementation)."""
        result = storage_service.delete_file("test/file.jpg")
        assert result is True

    def test_base_url_is_set(self) -> None:
        """Test that base_url is configured."""
        assert storage_service.base_url is not None
        assert len(storage_service.base_url) > 0
        assert storage_service.base_url.startswith("http")


class TestStorageServiceUrls:
    """Tests for URL format and structure."""

    def test_upload_url_has_signature(self) -> None:
        """Test that upload URL contains signature parameter."""
        url, _ = storage_service.generate_upload_url("test.jpg")
        assert "signature=" in url

    def test_upload_url_has_expires(self) -> None:
        """Test that upload URL contains expires parameter."""
        url, _ = storage_service.generate_upload_url("test.jpg")
        assert "expires=" in url

    def test_file_url_matches_base_url(self) -> None:
        """Test that file URL starts with base_url."""
        url = storage_service.get_file_url("test.jpg")
        assert url.startswith(storage_service.base_url)
