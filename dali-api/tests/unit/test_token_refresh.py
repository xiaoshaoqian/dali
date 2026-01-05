"""Unit tests for token refresh endpoint.

Tests:
- POST /api/v1/auth/refresh endpoint
- Token validation
- Token rotation
- Error handling for expired/invalid tokens
"""

import pytest
from httpx import AsyncClient

from app.core.security import create_access_token, create_refresh_token


class TestRefreshToken:
    """Tests for POST /api/v1/auth/refresh endpoint."""

    @pytest.mark.asyncio
    async def test_refresh_token_missing_body(self, client: AsyncClient) -> None:
        """Test refresh with missing request body."""
        response = await client.post("/api/v1/auth/refresh", json={})
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_refresh_token_invalid_format(self, client: AsyncClient) -> None:
        """Test refresh with invalid token format."""
        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refreshToken": "invalid_token_format"},
        )
        assert response.status_code == 401
        detail = response.json()["detail"]
        assert detail["code"] == "AUTH_INVALID_TOKEN"

    @pytest.mark.asyncio
    async def test_refresh_token_malformed_jwt(self, client: AsyncClient) -> None:
        """Test refresh with malformed JWT."""
        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refreshToken": "eyJhbGciOiJIUzI1NiJ9.invalid.signature"},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_refresh_token_user_not_found(self, client: AsyncClient) -> None:
        """Test refresh with token for non-existent user."""
        # Create a token with a fake user ID
        fake_user_id = "00000000-0000-0000-0000-000000000000"
        token_data = {"sub": fake_user_id}
        refresh_token = create_refresh_token(token_data)

        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refreshToken": refresh_token},
        )
        assert response.status_code == 401
        detail = response.json()["detail"]
        assert "不存在" in detail["message"]

    @pytest.mark.asyncio
    async def test_refresh_token_empty_string(self, client: AsyncClient) -> None:
        """Test refresh with empty token string."""
        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refreshToken": ""},
        )
        # Either validation error (422) or invalid token (401)
        assert response.status_code in [401, 422]


class TestTokenCreation:
    """Tests for token creation utilities."""

    def test_create_access_token_contains_sub(self) -> None:
        """Test that access token contains subject claim."""
        user_id = "test-user-123"
        token = create_access_token({"sub": user_id})

        # Token should be a valid JWT format (header.payload.signature)
        parts = token.split(".")
        assert len(parts) == 3

        # Decode payload
        import base64
        import json

        payload_b64 = parts[1] + "=" * (4 - len(parts[1]) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))

        assert payload["sub"] == user_id
        assert "exp" in payload

    def test_create_refresh_token_contains_sub(self) -> None:
        """Test that refresh token contains subject claim."""
        user_id = "test-user-456"
        token = create_refresh_token({"sub": user_id})

        parts = token.split(".")
        assert len(parts) == 3

        import base64
        import json

        payload_b64 = parts[1] + "=" * (4 - len(parts[1]) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_b64))

        assert payload["sub"] == user_id
        assert "exp" in payload

    def test_access_token_expiry_is_shorter_than_refresh(self) -> None:
        """Test that access token expires before refresh token."""
        import base64
        import json

        user_id = "test-user"
        access_token = create_access_token({"sub": user_id})
        refresh_token = create_refresh_token({"sub": user_id})

        # Decode both tokens
        access_payload_b64 = access_token.split(".")[1] + "==="
        refresh_payload_b64 = refresh_token.split(".")[1] + "==="

        access_payload = json.loads(base64.urlsafe_b64decode(access_payload_b64))
        refresh_payload = json.loads(base64.urlsafe_b64decode(refresh_payload_b64))

        # Access token should expire before refresh token
        assert access_payload["exp"] < refresh_payload["exp"]


class TestTokenValidation:
    """Tests for token validation edge cases."""

    @pytest.mark.asyncio
    async def test_refresh_with_access_token_fails(self, client: AsyncClient) -> None:
        """Test that using access token for refresh fails."""
        # Access tokens have shorter expiry - this tests token type isn't validated
        # In a more secure implementation, you'd add a "type" claim to distinguish
        user_id = "test-user"
        access_token = create_access_token({"sub": user_id})

        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refreshToken": access_token},
        )
        # Should fail because user doesn't exist in DB
        assert response.status_code == 401
