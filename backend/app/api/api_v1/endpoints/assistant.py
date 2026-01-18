from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models.habit import Habit, HabitLog
from app.models.user import User
from app.engine.gemini import gemini_client
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/daily-briefing")
async def get_daily_briefing(
    db: Session = Depends(deps.get_db),
    # current_user: User = Depends(deps.get_current_user) # Disabled for MVP
):
    # 1. Gather Context
    habits = db.query(Habit).all() # Should be filtered by user in real app
    user = db.query(User).first() # Mock: get first user

    if not habits:
        return {"briefing": "Welcome to HabitOS! Create your first habit to get started."}

    habits_summary = "\n".join([f"- {h.title} ({h.frequency}, Streak: {h.current_streak})" for h in habits])
    
    three_days_ago = datetime.utcnow() - timedelta(days=3)
    recent_logs = db.query(HabitLog).filter(HabitLog.completed_at >= three_days_ago).all()
    logs_summary = f"Total completions in last 3 days: {len(recent_logs)}"

    user_goals = user.goals if user and user.goals else "Be productive and consistent."

    # 2. Call Gemini
    briefing = await gemini_client.generate_daily_briefing(
        user_name=user.full_name if user else "Champion",
        habits_summary=habits_summary,
        recent_logs=logs_summary,
        goals=user_goals
    )
    
    return {"briefing": briefing}

@router.post("/onboarding")
async def onboard_user(
    goals: str,
    db: Session = Depends(deps.get_db)
):
    user = db.query(User).first()
    if not user:
        # Create a dummy user if none exists for MVP
        user = User(email="test@example.com", full_name="User", hashed_password="pw")
        db.add(user)
    
    user.goals = goals
    db.commit()
    return {"message": "Goals updated successfully"}

@router.get("/plan")
async def get_day_plan(
    db: Session = Depends(deps.get_db)
):
    # 1. Gather Context
    habits = db.query(Habit).all()
    user = db.query(User).first()
    
    if not habits:
        return {"plan": "Add some habits first!"}

    habits_summary = "\n".join([f"- {h.title} ({h.frequency}, Difficulty: {h.difficulty}/5)" for h in habits])
    user_goals = user.goals if user and user.goals else "Productivity and Health"

    # 2. Call Gemini
    plan = await gemini_client.generate_action_plan(
        user_name=user.full_name if user else "User",
        habits_summary=habits_summary,
        goals=user_goals
    )
    
    return {"plan": plan}
