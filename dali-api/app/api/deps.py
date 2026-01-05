"""Dependency injection for API routes."""

from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import async_session_maker


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Provide a database session for a request.

    Yields:
        AsyncSession: Database session that auto-commits on success
        and auto-rollbacks on exception.
    """
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# Type alias for dependency injection
DBSession = Annotated[AsyncSession, Depends(get_db)]
