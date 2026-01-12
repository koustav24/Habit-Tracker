from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

# --- User Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

# --- Habit Schemas ---
class HabitBase(BaseModel):
    title: str
    description: Optional[str] = None
    frequency: str = "daily"
    difficulty: int = 1

class HabitCreate(HabitBase):
    pass

class Habit(HabitBase):
    id: int
    user_id: int
    current_streak: int
    success_probability: float
    longest_streak: Optional[int] = 0
    created_at: datetime

    class Config:
        from_attributes = True

class HabitLogCreate(BaseModel):
    habit_id: int
    mood_score: Optional[int] = None
    difficulty_rating: Optional[int] = None

class HabitLog(HabitLogCreate):
    id: int
    completed_at: datetime
    
    class Config:
        from_attributes = True


# --- Intelligence Schemas ---
class RiskFactor(BaseModel):
    factor: str
    impact: float
    note: Optional[str] = None


class HabitInsight(BaseModel):
    habit_id: int
    success_probability: float
    risk_score: float
    risk_level: str
    factors: List[RiskFactor]
    recommendation: str
    model_version: str = "heuristic-v1"
    as_of: datetime
    history: List[datetime] = []

    class Config:
        from_attributes = True


class HabitHealth(BaseModel):
    id: int
    title: str
    success_probability: float
    risk_level: str
    recommendation: str


class DashboardSummary(BaseModel):
    total_habits: int
    avg_success_probability: float
    active_streaks: int
    at_risk: List[HabitHealth]

