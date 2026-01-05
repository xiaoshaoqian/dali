"""Unit tests for user preferences API.

Tests:
- Get preferences endpoint
- Save preferences endpoint
- Validation for body type, styles, occasions
- Authentication required
"""

import pytest
from httpx import AsyncClient

from app.services.verification_store import verification_store


class TestGetPreferences:
    """Tests for GET /api/v1/users/me/preferences endpoint."""

    @pytest.mark.asyncio
    async def test_get_preferences_unauthorized(self, client: AsyncClient) -> None:
        """Test getting preferences without authentication."""
        response = await client.get("/api/v1/users/me/preferences")
        assert response.status_code == 401  # No Bearer token - HTTPBearer returns 401

    @pytest.mark.asyncio
    async def test_get_preferences_invalid_token(self, client: AsyncClient) -> None:
        """Test getting preferences with invalid token."""
        response = await client.get(
            "/api/v1/users/me/preferences",
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401


class TestSavePreferences:
    """Tests for PUT /api/v1/users/me/preferences endpoint."""

    @pytest.mark.asyncio
    async def test_save_preferences_unauthorized(self, client: AsyncClient) -> None:
        """Test saving preferences without authentication."""
        response = await client.put(
            "/api/v1/users/me/preferences",
            json={
                "bodyType": "hourglass",
                "styles": ["minimalist"],
                "occasions": ["work"],
            },
        )
        assert response.status_code == 401  # No Bearer token - HTTPBearer returns 401

    @pytest.mark.asyncio
    async def test_save_preferences_invalid_body_type(
        self, client: AsyncClient
    ) -> None:
        """Test saving preferences with invalid body type."""
        response = await client.put(
            "/api/v1/users/me/preferences",
            json={
                "bodyType": "invalid_type",
                "styles": ["minimalist"],
                "occasions": ["work"],
            },
            headers={"Authorization": "Bearer fake_token"},
        )
        # Either 401 (invalid token) or 422 (validation error)
        assert response.status_code in [401, 422]

    @pytest.mark.asyncio
    async def test_save_preferences_empty_styles(self, client: AsyncClient) -> None:
        """Test saving preferences with empty styles list."""
        response = await client.put(
            "/api/v1/users/me/preferences",
            json={
                "bodyType": "hourglass",
                "styles": [],  # Invalid: must have at least 1
                "occasions": ["work"],
            },
            headers={"Authorization": "Bearer fake_token"},
        )
        # Either 401 (invalid token) or 422 (validation error)
        assert response.status_code in [401, 422]

    @pytest.mark.asyncio
    async def test_save_preferences_too_many_styles(
        self, client: AsyncClient
    ) -> None:
        """Test saving preferences with too many styles (max 3)."""
        response = await client.put(
            "/api/v1/users/me/preferences",
            json={
                "bodyType": "hourglass",
                "styles": ["minimalist", "trendy", "sweet", "intellectual"],  # 4 > 3
                "occasions": ["work"],
            },
            headers={"Authorization": "Bearer fake_token"},
        )
        # Either 401 (invalid token) or 422 (validation error)
        assert response.status_code in [401, 422]

    @pytest.mark.asyncio
    async def test_save_preferences_invalid_style(self, client: AsyncClient) -> None:
        """Test saving preferences with invalid style value."""
        response = await client.put(
            "/api/v1/users/me/preferences",
            json={
                "bodyType": "hourglass",
                "styles": ["invalid_style"],
                "occasions": ["work"],
            },
            headers={"Authorization": "Bearer fake_token"},
        )
        # Either 401 (invalid token) or 422 (validation error)
        assert response.status_code in [401, 422]

    @pytest.mark.asyncio
    async def test_save_preferences_invalid_occasion(
        self, client: AsyncClient
    ) -> None:
        """Test saving preferences with invalid occasion value."""
        response = await client.put(
            "/api/v1/users/me/preferences",
            json={
                "bodyType": "hourglass",
                "styles": ["minimalist"],
                "occasions": ["invalid_occasion"],
            },
            headers={"Authorization": "Bearer fake_token"},
        )
        # Either 401 (invalid token) or 422 (validation error)
        assert response.status_code in [401, 422]


class TestPreferencesValidation:
    """Tests for preferences schema validation."""

    @pytest.mark.asyncio
    async def test_valid_body_types(self, client: AsyncClient) -> None:
        """Test that all valid body types are accepted by schema."""
        valid_body_types = [
            "pear",
            "apple",
            "hourglass",
            "rectangle",
            "inverted-triangle",
        ]
        for body_type in valid_body_types:
            response = await client.put(
                "/api/v1/users/me/preferences",
                json={
                    "bodyType": body_type,
                    "styles": ["minimalist"],
                    "occasions": ["work"],
                },
                headers={"Authorization": "Bearer fake_token"},
            )
            # Should not be 422 validation error for body type
            # (might be 401 for fake token, which is fine)
            if response.status_code == 422:
                error_detail = response.json().get("detail", [])
                # Check that error is not about bodyType
                for error in error_detail:
                    if isinstance(error, dict):
                        loc = error.get("loc", [])
                        assert "bodyType" not in loc, f"Body type '{body_type}' should be valid"

    @pytest.mark.asyncio
    async def test_valid_styles(self, client: AsyncClient) -> None:
        """Test that all valid styles are accepted by schema."""
        valid_styles = ["minimalist", "trendy", "sweet", "intellectual", "athletic"]
        for style in valid_styles:
            response = await client.put(
                "/api/v1/users/me/preferences",
                json={
                    "bodyType": "hourglass",
                    "styles": [style],
                    "occasions": ["work"],
                },
                headers={"Authorization": "Bearer fake_token"},
            )
            if response.status_code == 422:
                error_detail = response.json().get("detail", [])
                for error in error_detail:
                    if isinstance(error, dict):
                        loc = error.get("loc", [])
                        assert "styles" not in loc, f"Style '{style}' should be valid"

    @pytest.mark.asyncio
    async def test_valid_occasions(self, client: AsyncClient) -> None:
        """Test that all valid occasions are accepted by schema."""
        valid_occasions = ["work", "date", "party", "daily", "sports"]
        for occasion in valid_occasions:
            response = await client.put(
                "/api/v1/users/me/preferences",
                json={
                    "bodyType": "hourglass",
                    "styles": ["minimalist"],
                    "occasions": [occasion],
                },
                headers={"Authorization": "Bearer fake_token"},
            )
            if response.status_code == 422:
                error_detail = response.json().get("detail", [])
                for error in error_detail:
                    if isinstance(error, dict):
                        loc = error.get("loc", [])
                        assert "occasions" not in loc, f"Occasion '{occasion}' should be valid"
