from fastapi import APIRouter, Depends
from app.models.user import User
from app.schemas.auth import UserResponse
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    # get_current_user handles token validation and DB lookup automatically
    return current_user
