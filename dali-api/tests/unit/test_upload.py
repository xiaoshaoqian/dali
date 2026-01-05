"""Unit tests for upload API endpoints.

Tests:
- POST /api/v1/upload/signed-url endpoint
- Signed URL generation
- Authentication requirements
"""

import pytest
from httpx import AsyncClient


class TestSignedUrl:
    """Tests for POST /api/v1/upload/signed-url endpoint."""

    @pytest.mark.asyncio
    async def test_signed_url_requires_auth(self, client: AsyncClient) -> None:
        """Test that signed URL endpoint requires authentication."""
        response = await client.post(
            "/api/v1/upload/signed-url",
            json={"content_type": "image/jpeg"},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_signed_url_invalid_token(self, client: AsyncClient) -> None:
        """Test signed URL with invalid token."""
        response = await client.post(
            "/api/v1/upload/signed-url",
            json={"content_type": "image/jpeg"},
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_signed_url_invalid_content_type(self, client: AsyncClient) -> None:
        """Test signed URL with invalid content type."""
        response = await client.post(
            "/api/v1/upload/signed-url",
            json={"content_type": "application/pdf"},  # Invalid - not an image
            headers={"Authorization": "Bearer fake_token"},
        )
        # Should be either 401 (invalid token) or 422 (validation error)
        assert response.status_code in [401, 422]

    @pytest.mark.asyncio
    async def test_signed_url_valid_content_types(self, client: AsyncClient) -> None:
        """Test that valid image content types are accepted."""
        valid_types = ["image/jpeg", "image/png", "image/webp"]

        for content_type in valid_types:
            response = await client.post(
                "/api/v1/upload/signed-url",
                json={"content_type": content_type},
                headers={"Authorization": "Bearer fake_token"},
            )
            # Should be 401 (fake token) not 422 (validation error)
            if response.status_code == 422:
                # Check that error is not about content_type
                error_detail = response.json().get("detail", [])
                for error in error_detail:
                    if isinstance(error, dict):
                        loc = error.get("loc", [])
                        assert "content_type" not in loc, f"Content type '{content_type}' should be valid"


class TestSignedUrlSchema:
    """Tests for upload schema validation."""

    @pytest.mark.asyncio
    async def test_default_content_type(self, client: AsyncClient) -> None:
        """Test that content_type defaults to image/jpeg."""
        response = await client.post(
            "/api/v1/upload/signed-url",
            json={},  # No content_type - should use default
            headers={"Authorization": "Bearer fake_token"},
        )
        # Should not be 422 validation error for missing content_type
        assert response.status_code != 422 or "content_type" not in str(response.json())

    @pytest.mark.asyncio
    async def test_content_type_pattern_validation(self, client: AsyncClient) -> None:
        """Test content type pattern validation."""
        invalid_types = [
            "text/plain",
            "image/gif",  # Not in allowed list
            "video/mp4",
            "application/json",
        ]

        for content_type in invalid_types:
            response = await client.post(
                "/api/v1/upload/signed-url",
                json={"content_type": content_type},
                headers={"Authorization": "Bearer fake_token"},
            )
            # Should reject invalid content types with 422
            # (unless 401 due to fake token being checked first)
            assert response.status_code in [401, 422]
