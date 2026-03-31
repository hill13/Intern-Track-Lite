from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional


class ApplicationCreate(BaseModel):
    company_name: str
    role_title: str
    stage: str
    source: str
    applied_date: Optional[date] = None   # defaults to today in the endpoint if not provided
    notes: Optional[str] = None
    job_url: Optional[str] = None


class ApplicationUpdate(BaseModel):
    # All fields optional — user can send just the fields they want to change
    company_name: Optional[str] = None
    role_title: Optional[str] = None
    stage: Optional[str] = None
    source: Optional[str] = None
    applied_date: Optional[date] = None
    notes: Optional[str] = None
    job_url: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    company_name: str
    role_title: str
    stage: str
    source: str
    applied_date: date
    notes: Optional[str] = None
    job_url: Optional[str] = None

    # Required to serialize SQLAlchemy ORM objects — without this Pydantic
    # expects a dict, but ORM objects are class instances with attributes
    model_config = ConfigDict(from_attributes=True)
