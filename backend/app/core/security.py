from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi import HTTPException
from app.core.config import settings

# The hashing "machine" — bcrypt is intentionally slow, making brute-force attacks expensive
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    # Turns "mysecret" into "$2b$12$..." — one-way, can't be reversed
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    # Hashes the plain password and compares it to the stored hash
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()  # don't mutate the original dict
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})  # add expiry claim to payload
    # Signs the payload with our SECRET_KEY — tampered tokens will fail verification
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        # Verifies signature + expiry automatically — raises JWTError if either fails
        jwt_decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return jwt_decoded
