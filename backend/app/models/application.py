from datetime import date, datetime
from typing import Optional
from sqlalchemy import ForeignKey, Index, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    company_name: Mapped[str] = mapped_column(nullable=False)
    role_title: Mapped[str] = mapped_column(nullable=False)
    stage: Mapped[str] = mapped_column(nullable=False)          # wishlist, applied, screening, interview, offer, rejected, withdrawn
    source: Mapped[str] = mapped_column(nullable=False)         # linkedin, handshake, indeed, company_website, referral, other
    notes: Mapped[Optional[str]] = mapped_column(nullable=True)
    job_url: Mapped[Optional[str]] = mapped_column(nullable=True)
    applied_date: Mapped[date] = mapped_column(default=date.today)  # Python-side default so each row gets insert date
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())  # DB sets this automatically

    __table_args__ = (
        Index("ix_applications_user_stage", "user_id", "stage"),    # fast filtered list by stage
        Index("ix_applications_user_source", "user_id", "source"),  # fast filtered list by source
    )
