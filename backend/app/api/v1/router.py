from fastapi import APIRouter
from app.api.v1 import auth, users

# Main v1 router — all endpoints are registered here
api_router = APIRouter()

# Each router is mounted with a prefix — this determines the URL structure
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
