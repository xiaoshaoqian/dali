"""Custom exception classes for the API.

Error code format: {DOMAIN}_{ERROR_TYPE}
Examples: AUTH_INVALID_TOKEN, OUTFIT_NOT_FOUND, VALIDATION_FAILED, AI_SERVICE_TIMEOUT
"""

from typing import Any


class APIException(Exception):
    """Base exception for all API errors."""

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details
        super().__init__(message)


class AuthenticationError(APIException):
    """Authentication related errors."""

    def __init__(
        self,
        code: str = "AUTH_FAILED",
        message: str = "Authentication failed",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code=code, message=message, status_code=401, details=details)


class AuthorizationError(APIException):
    """Authorization related errors."""

    def __init__(
        self,
        code: str = "AUTH_FORBIDDEN",
        message: str = "Permission denied",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code=code, message=message, status_code=403, details=details)


class NotFoundError(APIException):
    """Resource not found errors."""

    def __init__(
        self,
        code: str = "NOT_FOUND",
        message: str = "Resource not found",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code=code, message=message, status_code=404, details=details)


class ValidationError(APIException):
    """Validation related errors."""

    def __init__(
        self,
        code: str = "VALIDATION_FAILED",
        message: str = "Validation failed",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code=code, message=message, status_code=422, details=details)


class ExternalServiceError(APIException):
    """External service (AI, OSS, SMS) errors."""

    def __init__(
        self,
        code: str = "EXTERNAL_SERVICE_ERROR",
        message: str = "External service unavailable",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code=code, message=message, status_code=503, details=details)


class AIServiceTimeout(ExternalServiceError):
    """AI service timeout error."""

    def __init__(
        self,
        message: str = "AI service timeout",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code="AI_SERVICE_TIMEOUT", message=message, details=details)


class RateLimitedError(APIException):
    """Rate limit exceeded error."""

    def __init__(
        self,
        message: str = "请求过于频繁，请稍后重试",
        retry_after: int = 60,
        details: dict[str, Any] | None = None,
    ) -> None:
        error_details = details or {}
        error_details["retryAfter"] = retry_after
        super().__init__(
            code="AUTH_RATE_LIMITED",
            message=message,
            status_code=429,
            details=error_details,
        )
        self.retry_after = retry_after


class SMSError(ExternalServiceError):
    """SMS service error."""

    def __init__(
        self,
        message: str = "短信服务暂时不可用",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code="SMS_ERROR", message=message, details=details)


class InvalidCodeError(AuthenticationError):
    """Invalid verification code error."""

    def __init__(
        self,
        message: str = "验证码错误，请重试",
        attempts_remaining: int | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        error_details = details or {}
        if attempts_remaining is not None:
            error_details["attemptsRemaining"] = attempts_remaining
        super().__init__(
            code="AUTH_INVALID_CODE",
            message=message,
            details=error_details,
        )


class TokenExpiredError(AuthenticationError):
    """Access token expired error."""

    def __init__(
        self,
        message: str = "访问令牌已过期",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            code="AUTH_TOKEN_EXPIRED",
            message=message,
            details=details,
        )


class RefreshTokenExpiredError(AuthenticationError):
    """Refresh token expired error."""

    def __init__(
        self,
        message: str = "刷新令牌已过期，请重新登录",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            code="AUTH_REFRESH_TOKEN_EXPIRED",
            message=message,
            details=details,
        )


class InvalidTokenError(AuthenticationError):
    """Invalid token error."""

    def __init__(
        self,
        message: str = "无效的令牌",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            code="AUTH_INVALID_TOKEN",
            message=message,
            details=details,
        )
