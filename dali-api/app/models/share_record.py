"""Share record model for tracking outfit shares."""

import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.outfit import Outfit
    from app.models.user import User


class ShareRecord(Base):
    """Share record model for tracking outfit shares to social platforms."""

    __tablename__ = "share_records"

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
    outfit_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )
    platform: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    template_style: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    shared_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    def __repr__(self) -> str:
        """Return string representation of share record."""
        return f"<ShareRecord {self.id} user={self.user_id} platform={self.platform}>"
