from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class ApplicationTag(Base):
    __tablename__ = "application_tags"

    # Both columns form a composite primary key — ensures (app, tag) pair is unique
    # ondelete="CASCADE" — if the application or tag is deleted, this row is auto-deleted too
    application_id: Mapped[int] = mapped_column(ForeignKey("applications.id", ondelete="CASCADE"), primary_key=True)
    tag_id: Mapped[int] = mapped_column(ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)
