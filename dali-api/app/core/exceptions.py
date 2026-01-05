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
