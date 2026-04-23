from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class TagCreate(BaseModel):
    name: str
    color: str  # hex color e.g. "#ff0000"


class TagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


class TagResponse(BaseModel):
    id: int
    user_id: int
    name: str
    color: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
