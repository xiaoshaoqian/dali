"""Logging configuration for the API."""

import logging
import sys
from typing import Any

from app.config import settings


def setup_logging() -> None:
    """Configure logging for the application."""
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    # Set uvicorn access log level
    logging.getLogger("uvicorn.access").setLevel(log_level)

    # Reduce noise from third-party libraries
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the given name.

    Args:
        name: Logger name (typically __name__ of the module)

    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)


class StructuredLogger:
    """Helper class for structured logging with persistent context.

    Note: This is NOT a context manager. Use it to create a logger
    with pre-set context that will be included in all log messages.

    Usage:
        logger = StructuredLogger(get_logger(__name__), user_id="123", request_id="abc")
        logger.info("Processing request")  # Includes user_id and request_id in extra
    """

    def __init__(self, logger: logging.Logger, **context: Any) -> None:
        self.logger = logger
        self.context = context

    def info(self, message: str, **extra: Any) -> None:
        """Log info with context."""
        self.logger.info(message, extra={**self.context, **extra})

    def error(self, message: str, **extra: Any) -> None:
        """Log error with context."""
        self.logger.error(message, extra={**self.context, **extra})

    def warning(self, message: str, **extra: Any) -> None:
        """Log warning with context."""
        self.logger.warning(message, extra={**self.context, **extra})

    def debug(self, message: str, **extra: Any) -> None:
        """Log debug with context."""
        self.logger.debug(message, extra={**self.context, **extra})
