"""Common schemas for shared types."""

from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response schema."""

    items: list[T]
    total: int
    page: int
    pageSize: int


class ErrorResponse(BaseModel):
    """Standardized error response schema.

    Error code format: {DOMAIN}_{ERROR_TYPE}
    Examples: AUTH_INVALID_TOKEN, OUTFIT_NOT_FOUND, VALIDATION_FAILED
    """

    code: str
    message: str
    details: dict[str, Any] | None = None


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str
    version: str
