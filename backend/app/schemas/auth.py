from pydantic import BaseModel, ConfigDict
from datetime import datetime


class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    # Allows Pydantic to build this schema directly from a SQLAlchemy ORM object
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str  # will always be "bearer"
