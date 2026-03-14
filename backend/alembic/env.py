import asyncio
import os
from logging.config import fileConfig

from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context

# Import Base so Alembic knows about our table definitions
from app.core.database import Base

# IMPORTANT: import all models here so Base.metadata registers them
# If you skip this, autogenerate sees an empty schema and creates a no-op migration
import app.models.user  # noqa: F401

# Alembic config object — gives access to alembic.ini values
config = context.config

# Set up Python logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# This is what Alembic diffs against to generate migrations
target_metadata = Base.metadata


def get_url():
    # Read DATABASE_URL from environment — works both locally and in Docker
    return os.environ.get("DATABASE_URL", "postgresql+asyncpg://intern:intern@localhost:5432/interntrack")


def run_migrations_offline() -> None:
    """Run migrations without a live DB connection (generates SQL script instead)."""
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations with a live async DB connection."""
    connectable = create_async_engine(get_url())

    async with connectable.connect() as connection:
        # run_sync lets us call the synchronous Alembic migration API inside async context
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


# Entry point — Alembic calls this
if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
