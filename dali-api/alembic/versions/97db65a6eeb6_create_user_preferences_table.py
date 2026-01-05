"""create_user_preferences_table

Revision ID: 97db65a6eeb6
Revises: 72c396c5e2f2
Create Date: 2026-01-05 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '97db65a6eeb6'
down_revision: Union[str, Sequence[str], None] = '72c396c5e2f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create user_preferences table."""
    op.create_table(
        'user_preferences',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, index=True, nullable=False),
        sa.Column('body_type', sa.String(50), nullable=False),
        sa.Column('styles', postgresql.ARRAY(sa.String(50)), nullable=False),
        sa.Column('occasions', postgresql.ARRAY(sa.String(50)), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    """Drop user_preferences table."""
    op.drop_table('user_preferences')
