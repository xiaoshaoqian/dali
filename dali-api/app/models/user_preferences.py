"""User preferences model for storing personalization data.

Table: user_preferences
Naming convention: snake_case for database columns
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class UserPreferences(Base):
    """User preferences model for storing style and occasion preferences."""

    __tablename__ = "user_preferences"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    body_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    styles: Mapped[list[str]] = mapped_column(
        ARRAY(String(50)),
        nullable=False,
    )
    occasions: Mapped[list[str]] = mapped_column(
        ARRAY(String(50)),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="preferences")

    def __repr__(self) -> str:
        """Return string representation of preferences."""
        return f"<UserPreferences {self.id} user_id={self.user_id}>"
