from datetime import datetime, timedelta
from app.models.habit import Habit, HabitLog
from app.engine.intelligence import calculate_success_probability, assess_failure_risk

def test_probability_calculation():
    # Scenario 1: New Habit
    habit = Habit(current_streak=0, difficulty=1, created_at=datetime.utcnow())
    logs = []
    prob = calculate_success_probability(habit, logs)
    print(f"Scenario 1 (New): {prob} (Expected ~0.5)")
    assert 0.4 <= prob <= 0.6

    # Scenario 2: High Streak
    habit.current_streak = 10
    habit.difficulty = 1
    # Mock logs for consistency
    logs = [HabitLog() for _ in range(10)]
    # adjust created_at to be 10 days ago
    habit.created_at = datetime.utcnow() - timedelta(days=10)
    
    prob = calculate_success_probability(habit, logs)
    print(f"Scenario 2 (High Streak): {prob} (Expected > 0.8)")
    assert prob > 0.8

    # Scenario 3: Hard Habit, No Streak
    habit.current_streak = 0
    habit.difficulty = 5 # Max difficulty
    habit.created_at = datetime.utcnow() - timedelta(days=5)
    logs = [] # 0 consistency
    
    prob = calculate_success_probability(habit, logs)
    print(f"Scenario 3 (Hard, Fail): {prob} (Expected < 0.4)")
    assert prob < 0.4


def test_risk_assessment():
    habit = Habit(current_streak=0, difficulty=4, created_at=datetime.utcnow() - timedelta(days=7))
    logs = []
    risk = assess_failure_risk(habit, logs)
    assert 0 <= risk["risk_score"] <= 1
    assert risk["risk_level"] in {"low", "medium", "high"}

    # Low risk case: strong streak
    habit.current_streak = 7
    habit.difficulty = 1
    logs = [HabitLog(completed_at=datetime.utcnow() - timedelta(days=i)) for i in range(7)]
    risk_low = assess_failure_risk(habit, logs)
    assert risk_low["risk_score"] < risk["risk_score"]

if __name__ == "__main__":
    test_probability_calculation()
    test_risk_assessment()
