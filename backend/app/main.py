from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_v1.api import api_router
from app.db.base import Base
from app.db.session import engine

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HabitOS API",
    description="The Operating System for Human Discipline",
    version="0.1.0"
)

# CORS - Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"system": "HabitOS", "status": "online", "message": "Discipline is freedom."}
