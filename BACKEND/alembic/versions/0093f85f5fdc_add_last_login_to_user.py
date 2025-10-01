"""Add last_login to User

Revision ID: 0093f85f5fdc
Revises: 
Create Date: 2025-10-01 17:20:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0093f85f5fdc'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add last_login column to users table."""
    op.add_column(
        'users',
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    """Remove last_login column from users table."""
    op.drop_column('users', 'last_login')
