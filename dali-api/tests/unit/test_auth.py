"""Unit tests for SMS authentication.

Tests:
- Phone number validation
- SMS send endpoint
- SMS verify endpoint
- Rate limiting
- Verification code expiry
"""

import pytest
from httpx import AsyncClient

from app.services.verification_store import verification_store


class TestSendSMS:
    """Tests for POST /api/v1/auth/sms/send endpoint."""

    @pytest.mark.asyncio
    async def test_send_sms_valid_phone(self, client: AsyncClient) -> None:
        """Test sending SMS to valid phone number."""
        # Clear any existing code first
        verification_store._store.clear()

        response = await client.post(
            "/api/v1/auth/sms/send",
            json={"phone": "13800138000"},
        )
        assert response.status_code == 200
        assert response.json()["message"] == "验证码已发送"

    @pytest.mark.asyncio
    async def test_send_sms_invalid_phone_format(self, client: AsyncClient) -> None:
        """Test sending SMS to invalid phone number format."""
        response = await client.post(
            "/api/v1/auth/sms/send",
            json={"phone": "invalid"},
        )
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_send_sms_invalid_phone_prefix(self, client: AsyncClient) -> None:
        """Test sending SMS to phone with invalid prefix (must start with 1[3-9])."""
        response = await client.post(
            "/api/v1/auth/sms/send",
            json={"phone": "12800138000"},  # Invalid: 2 is not in [3-9]
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_send_sms_phone_too_short(self, client: AsyncClient) -> None:
        """Test sending SMS to phone number that is too short."""
        response = await client.post(
            "/api/v1/auth/sms/send",
            json={"phone": "1380013800"},  # 10 digits instead of 11
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_send_sms_rate_limited(self, client: AsyncClient) -> None:
        """Test rate limiting for SMS sending."""
        # Clear any existing code
        verification_store._store.clear()

        # First request should succeed
        response1 = await client.post(
            "/api/v1/auth/sms/send",
            json={"phone": "13900139000"},
        )
        assert response1.status_code == 200

        # Second request within 60 seconds should be rate limited
        response2 = await client.post(
            "/api/v1/auth/sms/send",
            json={"phone": "13900139000"},
        )
        assert response2.status_code == 429
        # HTTPException wraps error in "detail" field
        detail = response2.json()["detail"]
        assert detail["code"] == "AUTH_RATE_LIMITED"


class TestVerifySMS:
    """Tests for POST /api/v1/auth/sms/verify endpoint."""

    @pytest.mark.asyncio
    async def test_verify_sms_invalid_code_format(self, client: AsyncClient) -> None:
        """Test verification with invalid code format."""
        response = await client.post(
            "/api/v1/auth/sms/verify",
            json={"phone": "13800138000", "code": "abc123"},  # Non-numeric
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_verify_sms_code_too_short(self, client: AsyncClient) -> None:
        """Test verification with code that is too short."""
        response = await client.post(
            "/api/v1/auth/sms/verify",
            json={"phone": "13800138000", "code": "12345"},  # 5 digits
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_verify_sms_wrong_code(self, client: AsyncClient) -> None:
        """Test verification with wrong code."""
        # Store a known code
        verification_store._store.clear()
        verification_store.store_code("13800138000", "123456")

        response = await client.post(
            "/api/v1/auth/sms/verify",
            json={"phone": "13800138000", "code": "000000"},
        )
        assert response.status_code == 401
        # HTTPException wraps error in "detail" field
        detail = response.json()["detail"]
        assert detail["code"] == "AUTH_INVALID_CODE"

    @pytest.mark.asyncio
    async def test_verify_sms_no_code_sent(self, client: AsyncClient) -> None:
        """Test verification when no code was sent."""
        verification_store._store.clear()

        response = await client.post(
            "/api/v1/auth/sms/verify",
            json={"phone": "13800138001", "code": "123456"},
        )
        assert response.status_code == 401
        # HTTPException wraps error in "detail" field
        detail = response.json()["detail"]
        assert "不存在" in detail["message"] or "过期" in detail["message"]


class TestVerificationStore:
    """Unit tests for VerificationStore."""

    def test_store_and_verify_code(self) -> None:
        """Test storing and verifying a code."""
        verification_store._store.clear()
        verification_store.store_code("13800138000", "123456")

        success, error = verification_store.verify_code("13800138000", "123456")
        assert success is True
        assert error is None

    def test_verify_wrong_code_increments_attempts(self) -> None:
        """Test that wrong code increments attempt counter."""
        verification_store._store.clear()
        verification_store.store_code("13800138000", "123456")

        success, error = verification_store.verify_code("13800138000", "000000")
        assert success is False
        assert "2" in error or "还可尝试" in error  # Should show remaining attempts

    def test_max_attempts_exceeded(self) -> None:
        """Test that code is deleted after max attempts."""
        verification_store._store.clear()
        verification_store.store_code("13800138000", "123456")

        # Use up all attempts
        for _ in range(3):
            verification_store.verify_code("13800138000", "000000")

        # Code should be deleted now
        success, error = verification_store.verify_code("13800138000", "123456")
        assert success is False
        assert "不存在" in error or "过期" in error

    def test_rate_limit_check(self) -> None:
        """Test rate limit checking."""
        verification_store._store.clear()

        # Should be able to send initially
        can_send, retry_after = verification_store.can_send("13800138000")
        assert can_send is True
        assert retry_after == 0

        # Store a code
        verification_store.store_code("13800138000", "123456")

        # Should not be able to send immediately after
        can_send, retry_after = verification_store.can_send("13800138000")
        assert can_send is False
        assert retry_after > 0

    def test_cleanup_expired(self) -> None:
        """Test cleanup of expired codes."""
        from datetime import UTC, datetime, timedelta

        verification_store._store.clear()

        # Add an expired code manually
        expired_time = datetime.now(UTC) - timedelta(minutes=10)
        verification_store._store["13800138000"] = ("123456", expired_time, 0)

        # Run cleanup
        removed = verification_store.cleanup_expired()
        assert removed == 1
        assert "13800138000" not in verification_store._store
