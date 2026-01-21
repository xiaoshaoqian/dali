"""Add outfit streaming fields for AI generation upgrade

Revision ID: f8a2c1b3d4e5
Revises: 3e390cb5626f
Create Date: 2026-01-18 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f8a2c1b3d4e5'
down_revision: Union[str, Sequence[str], None] = '3e390cb5626f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add new columns to outfits table for streaming AI generation."""
    # Source image URL (user's garment photo)
    op.add_column('outfits', sa.Column('source_image_url', sa.String(length=500), nullable=True))

    # AI-generated outfit visualization image URL
    op.add_column('outfits', sa.Column('generated_image_url', sa.String(length=500), nullable=True))

    # OSS object key for generated image (for cleanup)
    op.add_column('outfits', sa.Column('generated_image_key', sa.String(length=200), nullable=True))

    # Streamed theory/explanation text from AI
    op.add_column('outfits', sa.Column('theory_text', sa.Text(), nullable=True))

    # Selected anchor point category (外套, 裤子, etc.)
    op.add_column('outfits', sa.Column('selected_item', sa.String(length=50), nullable=True))


def downgrade() -> None:
    """Remove streaming fields from outfits table."""
    op.drop_column('outfits', 'selected_item')
    op.drop_column('outfits', 'theory_text')
    op.drop_column('outfits', 'generated_image_key')
    op.drop_column('outfits', 'generated_image_url')
    op.drop_column('outfits', 'source_image_url')
