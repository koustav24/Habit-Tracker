from fastapi import APIRouter
from app.api.api_v1.endpoints import habits, assistant

api_router = APIRouter()
api_router.include_router(habits.router, prefix="/habits", tags=["habits"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["assistant"])
