from datetime import date
from pydantic import BaseModel


# One row of the by-stage response — e.g. {"stage": "applied", "count": 12}
class StageCount(BaseModel):
    stage: str
    count: int


# One row of the velocity response — e.g. {"week_start": "2026-05-11", "count": 3}
# week_start is the Monday of the bucket (matches Postgres DATE_TRUNC('week', applied_date))
class VelocityPoint(BaseModel):
    week_start: date
    count: int
