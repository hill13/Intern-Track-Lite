from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.dependencies import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email already taken
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()

    if existing_user is not None:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user with hashed password — never store plain text
    new_user = User(email=user_data.email, hashed_password=hash_password(user_data.password))

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)  # refreshes new_user with DB-generated fields (id, created_at)

    return new_user


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    # Look up user by email
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()

    if existing_user is None:
        # Same error for wrong email AND wrong password — prevents enumeration attacks
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(user_data.password, existing_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create JWT with email as the subject claim
    token = create_access_token({"sub": existing_user.email})

    return Token(access_token=token, token_type="bearer")
