"""Outfit model for storing user outfit generation history."""

import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.share_record import ShareRecord
    from app.models.user import User


class Outfit(Base):
    """Outfit model for storing generated outfit combinations."""

    __tablename__ = "outfits"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        index=True,
        nullable=False,
    )
    occasion: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    # Source image URL (user's garment photo)
    source_image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    # AI-generated outfit visualization image URL
    generated_image_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    # OSS object key for generated image (for cleanup)
    generated_image_key: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )
    # Streamed theory/explanation text from AI
    theory_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    # Selected anchor point category (外套, 裤子, etc.)
    selected_item: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    is_favorited: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
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
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    def __repr__(self) -> str:
        """Return string representation of outfit."""
        return f"<Outfit {self.id} user={self.user_id}>"
