from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.api import deps
from app.models.habit import Habit, HabitLog, PredictionLog
from app.schemas import schemas
from app.engine.intelligence import calculate_success_probability, assess_failure_risk

router = APIRouter()

@router.post("/", response_model=schemas.Habit)
def create_habit(
    habit_in: schemas.HabitCreate,
    db: Session = Depends(deps.get_db)
    # current_user... (skip auth for MVP speed, assume user_id=1)
) -> Any:
    """
    Create a new habit.
    """
    user_id = 1 # Hardcoded for MVP
    habit = Habit(
        **habit_in.model_dump(),
        user_id=user_id,
        current_streak=0,
        success_probability=0.5 # Initial guess
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit

@router.get("/", response_model=List[schemas.Habit])
def read_habits(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Retrieve habits.
    """
    habits = db.query(Habit).offset(skip).limit(limit).all()
    return habits


@router.get("/{habit_id}/insights", response_model=schemas.HabitInsight)
def habit_insights(
    habit_id: int,
    db: Session = Depends(deps.get_db)
) -> Any:
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    logs = db.query(HabitLog).filter(HabitLog.habit_id == habit_id).all()

    success_prob = calculate_success_probability(habit, logs)
    risk = assess_failure_risk(habit, logs)

    # Persist latest probability and log prediction event
    habit.success_probability = success_prob

    prediction = PredictionLog(
        habit_id=habit_id,
        predicted_for=datetime.utcnow() + timedelta(days=1),
        score=risk["risk_score"],
        risk_level=risk["risk_level"],
        explanation=risk["recommendation"],
    )
    db.add(prediction)
    db.add(habit)
    db.commit()

    return schemas.HabitInsight(
        habit_id=habit_id,
        success_probability=success_prob,
        risk_score=risk["risk_score"],
        risk_level=risk["risk_level"],
        factors=[schemas.RiskFactor(**f) for f in risk["factors"]],
        recommendation=risk["recommendation"],
        as_of=datetime.utcnow(),
        history=[log.completed_at for log in logs]
    )


@router.get("/dashboard/summary", response_model=schemas.DashboardSummary)
def dashboard_summary(db: Session = Depends(deps.get_db)) -> Any:
    habits = db.query(Habit).all()
    at_risk = []
    total_prob = 0.0

    for habit in habits:
        logs = db.query(HabitLog).filter(HabitLog.habit_id == habit.id).all()
        success_prob = calculate_success_probability(habit, logs)
        risk = assess_failure_risk(habit, logs)

        total_prob += success_prob

        if risk["risk_level"] != "low":
            at_risk.append(
                schemas.HabitHealth(
                    id=habit.id,
                    title=habit.title,
                    success_probability=success_prob,
                    risk_level=risk["risk_level"],
                    recommendation=risk["recommendation"],
                )
            )

    avg_prob = total_prob / len(habits) if habits else 0.0

    return schemas.DashboardSummary(
        total_habits=len(habits),
        avg_success_probability=avg_prob,
        active_streaks=sum(1 for h in habits if h.current_streak > 0),
        at_risk=sorted(at_risk, key=lambda h: h.success_probability)[:5],
    )

@router.post("/{habit_id}/log", response_model=schemas.HabitLog)
def log_habit(
    habit_id: int,
    log_in: schemas.HabitLogCreate,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Log a habit completion. Updates streak and probability.
    """
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
        
    # Check if already logged today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    existing_log = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.completed_at >= today_start
    ).first()
    
    if existing_log:
        # Idempotent: If already logged, just return the existing log
        return existing_log
        
    # Create Log
    log = HabitLog(
        **log_in.model_dump(exclude={'habit_id'}),
        habit_id=habit_id,
        completed_at=datetime.utcnow()
    )
    db.add(log)
    
    # Update Streak Logic
    # Get last log
    last_log = db.query(HabitLog).filter(
        HabitLog.habit_id == habit_id,
        HabitLog.completed_at < today_start
    ).order_by(HabitLog.completed_at.desc()).first()
    
    if last_log:
        last_log_date = last_log.completed_at.date()
        yesterday = datetime.utcnow().date() - timedelta(days=1)
        if last_log_date == yesterday:
            habit.current_streak += 1
        elif last_log_date < yesterday:
            habit.current_streak = 1 # Reset
        else:
            # Should be covered by "existing_log" check but safety first
            pass
    else:
        habit.current_streak = 1 # First log
        
    if habit.current_streak > habit.longest_streak:
        habit.longest_streak = habit.current_streak

    # Recalculate Probability
    all_logs = db.query(HabitLog).filter(HabitLog.habit_id == habit_id).all()
    all_logs.append(log) # Include current
    habit.success_probability = calculate_success_probability(habit, all_logs)
    
    db.add(habit)
    db.commit()
    db.refresh(log)
    return log
