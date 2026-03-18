from datetime import datetime
from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)  # indexed for fast lookup by email
    hashed_password: Mapped[str]  # non-nullable by default in SQLAlchemy 2.0
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())  # DB sets this automatically
