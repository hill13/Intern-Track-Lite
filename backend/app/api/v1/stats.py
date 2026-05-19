from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db, get_current_user
from app.models.application import Application
from app.models.user import User
from app.schemas.stats import StageCount, VelocityPoint

router = APIRouter()


@router.get("/by-stage", response_model=list[StageCount])
async def stats_by_stage(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # SELECT stage, COUNT(*) FROM applications WHERE user_id = :uid GROUP BY stage
    # Uses ix_applications_user_stage composite index → index-only scan
    query = (
        select(Application.stage, func.count())
        .where(Application.user_id == current_user.id)
        .group_by(Application.stage)
    )
    result = await db.execute(query)

    # Multi-column SELECT → result.all() returns tuples; scalars() would lose the count.
    # Build StageCount instances explicitly — tuples don't auto-convert to the schema.
    rows = result.all()
    return [StageCount(stage=stage, count=count) for stage, count in rows]


@router.get("/velocity", response_model=list[VelocityPoint])
async def stats_velocity(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 12-week window — cutoff is a real date, comparable to applied_date directly.
    cutoff = date.today() - timedelta(weeks=12)

    # Per-row bucket label: the Monday of each application's week.
    # .label() names the computed column so we can reuse it in group_by / order_by.
    week_start = func.date_trunc("week", Application.applied_date).label("week_start")

    query = (
        select(week_start, func.count())
        .where(Application.user_id == current_user.id)
        .where(Application.applied_date >= cutoff)
        .group_by(week_start)
        .order_by(week_start)
    )
    result = await db.execute(query)
    rows = result.all()

    # DATE_TRUNC returns a timestamp even for date input — strip the time with .date().
    return [VelocityPoint(week_start=ws.date(), count=count) for ws, count in rows]
