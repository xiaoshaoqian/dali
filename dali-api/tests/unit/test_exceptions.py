"""Unit tests for exception handling."""


from app.core.exceptions import (
    APIException,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ValidationError,
)


class TestExceptionClasses:
    """Test custom exception classes."""

    def test_api_exception_default_values(self) -> None:
        """Test APIException with default values."""
        exc = APIException(code="TEST_ERROR", message="Test error")
        assert exc.code == "TEST_ERROR"
        assert exc.message == "Test error"
        assert exc.status_code == 400
        assert exc.details is None

    def test_api_exception_with_details(self) -> None:
        """Test APIException with custom details."""
        details = {"field": "username", "reason": "too short"}
        exc = APIException(
            code="VALIDATION_FAILED",
            message="Validation failed",
            status_code=422,
            details=details,
        )
        assert exc.status_code == 422
        assert exc.details == details

    def test_authentication_error(self) -> None:
        """Test AuthenticationError defaults to 401."""
        exc = AuthenticationError()
        assert exc.status_code == 401
        assert exc.code == "AUTH_FAILED"

    def test_authorization_error(self) -> None:
        """Test AuthorizationError defaults to 403."""
        exc = AuthorizationError()
        assert exc.status_code == 403
        assert exc.code == "AUTH_FORBIDDEN"

    def test_not_found_error(self) -> None:
        """Test NotFoundError defaults to 404."""
        exc = NotFoundError(code="USER_NOT_FOUND", message="User not found")
        assert exc.status_code == 404
        assert exc.code == "USER_NOT_FOUND"

    def test_validation_error(self) -> None:
        """Test ValidationError defaults to 422."""
        exc = ValidationError()
        assert exc.status_code == 422
        assert exc.code == "VALIDATION_FAILED"
