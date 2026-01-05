"""Database initialization utilities."""

from sqlalchemy.ext.asyncio import AsyncEngine

from app.models.base import Base


async def init_db(engine: AsyncEngine) -> None:
    """Initialize database tables.

    Args:
        engine: Async SQLAlchemy engine

    Note:
        In production, use Alembic migrations instead of create_all.
        This function is for development/testing only.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def drop_db(engine: AsyncEngine) -> None:
    """Drop all database tables.

    Args:
        engine: Async SQLAlchemy engine

    Warning:
        This will delete all data. Use only in development/testing.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
