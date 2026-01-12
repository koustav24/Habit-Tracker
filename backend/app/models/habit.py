from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.base import Base

class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    frequency = Column(String, default="daily") # daily, weekly
    difficulty = Column(Integer, default=1) # 1-5 scale
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Intelligence fields
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    success_probability = Column(Float, default=0.5)

    logs = relationship("HabitLog", back_populates="habit")

class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"))
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Metadata for AI
    mood_score = Column(Integer, nullable=True) # User reported mood
    difficulty_rating = Column(Integer, nullable=True) # User reported difficulty

    habit = relationship("Habit", back_populates="logs")


class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    predicted_for = Column(DateTime, nullable=False)
    score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)
    explanation = Column(Text, nullable=True)
    model_version = Column(String, default="heuristic-v1")
    created_at = Column(DateTime, default=datetime.utcnow)

    habit = relationship("Habit", backref="predictions")
