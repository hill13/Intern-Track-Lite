from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings


# Creates the async connection pool to PostgreSQL
engine = create_async_engine(settings.DATABASE_URL, echo=True)  # echo=True logs all SQL — turn off in prod

# Factory that produces new async sessions on demand
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


# All SQLAlchemy models will inherit from this Base so Alembic can detect them
class Base(DeclarativeBase):
    pass
