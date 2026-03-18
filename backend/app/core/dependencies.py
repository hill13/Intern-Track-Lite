from typing import AsyncGenerator
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.security import decode_access_token
from app.models.user import User

# Tells FastAPI where clients post credentials to get a token (used by auto-docs UI)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    # Yields a DB session for each request, closes it automatically when done
    async with AsyncSessionLocal() as session:
        yield session


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    payload_dict = decode_access_token(token)  # raises 401 automatically if token invalid
    email = payload_dict.get("sub")            # extract email from token payload

    if email is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()  # returns User object or None

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user
