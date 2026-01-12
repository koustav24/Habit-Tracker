from fastapi import APIRouter
from app.api.api_v1.endpoints import habits

api_router = APIRouter()
api_router.include_router(habits.router, prefix="/habits", tags=["habits"])
