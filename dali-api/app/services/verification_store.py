"""In-memory verification code storage with TTL.

This module provides thread-safe storage for SMS verification codes
with automatic expiration and rate limiting.
"""

from datetime import UTC, datetime, timedelta
from threading import Lock


class VerificationStore:
    """In-memory store for SMS verification codes.

    Features:
    - Thread-safe operations using locks
    - Automatic code expiration (5 minutes)
    - Rate limiting (1 SMS per 60 seconds per phone)
    - Verification attempt tracking (max 3 attempts)
    """

    def __init__(self) -> None:
        """Initialize the verification store."""
        self._store: dict[str, tuple[str, datetime, int]] = {}  # phone -> (code, created_at, attempts)
        self._lock = Lock()
        self.code_expiry = timedelta(minutes=5)
        self.rate_limit = timedelta(seconds=60)
        self.max_attempts = 3

    def store_code(self, phone: str, code: str) -> None:
        """Store a verification code for a phone number.

        Args:
            phone: Phone number to store code for
            code: 6-digit verification code
        """
        with self._lock:
            self._store[phone] = (code, datetime.now(UTC), 0)

    def verify_code(self, phone: str, code: str) -> tuple[bool, str | None]:
        """Verify a code for a phone number.

        Args:
            phone: Phone number to verify
            code: Code to verify

        Returns:
            Tuple of (success, error_message)
        """
        with self._lock:
            if phone not in self._store:
                return False, "验证码不存在或已过期"

            stored_code, created_at, attempts = self._store[phone]

            # Check if code expired
            if datetime.now(UTC) - created_at > self.code_expiry:
                del self._store[phone]
                return False, "验证码已过期，请重新获取"

            # Check attempts
            if attempts >= self.max_attempts:
                del self._store[phone]
                return False, "验证码错误次数过多，请重新获取"

            # Verify code
            if stored_code != code:
                self._store[phone] = (stored_code, created_at, attempts + 1)
                remaining = self.max_attempts - attempts - 1
                if remaining > 0:
                    return False, f"验证码错误，还可尝试 {remaining} 次"
                else:
                    del self._store[phone]
                    return False, "验证码错误次数过多，请重新获取"

            # Success - remove code
            del self._store[phone]
            return True, None

    def can_send(self, phone: str) -> tuple[bool, int]:
        """Check if a new code can be sent to this phone number.

        Args:
            phone: Phone number to check

        Returns:
            Tuple of (can_send, retry_after_seconds)
        """
        with self._lock:
            if phone not in self._store:
                return True, 0

            _, created_at, _ = self._store[phone]
            elapsed = datetime.now(UTC) - created_at

            if elapsed >= self.rate_limit:
                return True, 0

            retry_after = int((self.rate_limit - elapsed).total_seconds())
            return False, retry_after

    def cleanup_expired(self) -> int:
        """Remove expired codes from the store.

        Returns:
            Number of entries removed
        """
        with self._lock:
            now = datetime.now(UTC)
            expired = [
                phone
                for phone, (_, created_at, _) in self._store.items()
                if now - created_at > self.code_expiry
            ]
            for phone in expired:
                del self._store[phone]
            return len(expired)


# Global store instance
verification_store = VerificationStore()


async def start_cleanup_task() -> None:
    """Start background cleanup task for expired codes.

    Call this on application startup.
    This function should be called with asyncio.create_task() in the app lifespan.
    """
    import asyncio
    import logging

    logger = logging.getLogger(__name__)

    while True:
        await asyncio.sleep(300)  # Run every 5 minutes
        removed = verification_store.cleanup_expired()
        if removed > 0:
            logger.debug(f"Cleaned up {removed} expired verification codes")
