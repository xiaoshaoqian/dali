"""Authentication service for SMS login.

This module handles user authentication via SMS verification codes.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.exceptions import InvalidCodeError, InvalidTokenError
from app.core.security import create_access_token, create_refresh_token, verify_token
from app.models.user import User
from app.schemas.auth import RefreshTokenResponse, TokenResponse
from app.services.sms import sms_service


class AuthService:
    """Authentication service for user login and registration."""

    async def send_sms_code(self, phone: str) -> None:
        """Send SMS verification code to phone number.

        Args:
            phone: Phone number to send code to

        Raises:
            RateLimitedError: If rate limit exceeded
            SMSError: If SMS sending fails
        """
        await sms_service.send_verification_code(phone)

    async def verify_sms_and_login(
        self,
        phone: str,
        code: str,
        db: AsyncSession,
    ) -> tuple[TokenResponse, bool]:
        """Verify SMS code and authenticate user.

        Args:
            phone: Phone number that received the code
            code: Verification code to verify
            db: Database session

        Returns:
            Tuple of (TokenResponse, is_new_user)

        Raises:
            InvalidCodeError: If code verification fails
        """
        # Verify the code
        success, error_message = sms_service.verify_code(phone, code)
        if not success:
            raise InvalidCodeError(message=error_message or "验证码错误，请重试")

        # Get or create user
        user, is_new_user = await self._get_or_create_user(phone, db)

        # Generate tokens
        token_response = self._create_token_response(user, is_new_user)

        return token_response, is_new_user

    async def refresh_tokens(
        self,
        refresh_token: str,
        db: AsyncSession,
    ) -> RefreshTokenResponse:
        """Refresh access token using refresh token.

        Args:
            refresh_token: JWT refresh token
            db: Database session

        Returns:
            RefreshTokenResponse with new tokens

        Raises:
            InvalidTokenError: If refresh token is invalid
            RefreshTokenExpiredError: If refresh token is expired
        """
        # Verify the refresh token
        payload = verify_token(refresh_token)
        if payload is None:
            raise InvalidTokenError(message="无效的刷新令牌")

        # Get user ID from token
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise InvalidTokenError(message="无效的令牌格式")

        # Verify user still exists and is active
        import uuid
        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError as e:
            raise InvalidTokenError(message="无效的用户ID") from e

        stmt = select(User).where(User.id == user_id, User.is_deleted.is_(False))
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if user is None:
            raise InvalidTokenError(message="用户不存在")

        if not user.is_active:
            raise InvalidTokenError(message="用户已被禁用")

        # Generate new tokens (token rotation for security)
        token_data = {"sub": str(user.id)}
        new_access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)

        return RefreshTokenResponse(
            accessToken=new_access_token,
            refreshToken=new_refresh_token,
            expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def _get_or_create_user(
        self,
        phone: str,
        db: AsyncSession,
    ) -> tuple[User, bool]:
        """Get existing user or create new one.

        Args:
            phone: Phone number to look up
            db: Database session

        Returns:
            Tuple of (User, is_new_user)
        """
        # Look for existing user
        stmt = select(User).where(User.phone == phone, User.is_deleted.is_(False))
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if user:
            return user, False

        # Create new user
        user = User(phone=phone)
        db.add(user)
        await db.flush()  # Get the ID without committing
        return user, True

    def _create_token_response(self, user: User, is_new_user: bool) -> TokenResponse:
        """Create JWT tokens for user.

        Args:
            user: User to create tokens for
            is_new_user: Whether this is a new registration

        Returns:
            TokenResponse with access and refresh tokens
        """
        token_data = {"sub": str(user.id)}

        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return TokenResponse(
            userId=str(user.id),
            accessToken=access_token,
            refreshToken=refresh_token,
            expiresIn=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            isNewUser=is_new_user,
        )


# Global service instance
auth_service = AuthService()
