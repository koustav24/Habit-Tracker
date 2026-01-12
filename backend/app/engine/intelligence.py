from datetime import datetime, timedelta


def assess_failure_risk(habit, logs):
    """
    Heuristic risk scoring for next-day failure risk. Returns dict with:
    - risk_score: 0-1 (higher = riskier)
    - risk_level: "low" | "medium" | "high"
    - factors: list of {factor, impact, note}
    - recommendation: text suggestion

    Signals used:
    - Recency: days since last completion
    - Streak momentum: longer streak lowers risk
    - Consistency: completions / days since creation
    - Difficulty: higher difficulty raises risk
    """
    now = datetime.utcnow()
    days_since_creation = max((now - habit.created_at).days + 1, 1)
    total_logs = len(logs)

    # Recency
    if logs:
        last_log = max(logs, key=lambda l: l.completed_at)
        days_since_last = max((now - last_log.completed_at).days, 0)
    else:
        days_since_last = days_since_creation

    consistency = total_logs / days_since_creation

    # Impact components (positive = more risk)
    factors = []

    # Difficulty penalty
    difficulty_penalty = (habit.difficulty - 1) * 0.06  # up to +0.24
    factors.append({"factor": "difficulty", "impact": difficulty_penalty, "note": f"difficulty {habit.difficulty}/5"})

    # Inactivity penalty
    inactivity_penalty = min(days_since_last * 0.08, 0.32)
    factors.append({"factor": "inactivity", "impact": inactivity_penalty, "note": f"{days_since_last} days since last completion"})

    # Consistency bonus
    consistency_bonus = min(consistency * 0.25, 0.3)
    factors.append({"factor": "consistency", "impact": -consistency_bonus, "note": f"{total_logs} logs / {days_since_creation} days"})

    # Streak bonus
    streak_bonus = min(habit.current_streak * 0.05, 0.35)
    factors.append({"factor": "streak", "impact": -streak_bonus, "note": f"streak {habit.current_streak}"})

    # Aggregate
    base = 0.45
    risk_score = base + sum(f["impact"] for f in factors)
    risk_score = max(0.05, min(0.95, risk_score))

    if risk_score >= 0.7:
        risk_level = "high"
        recommendation = "Book a micro-version for tomorrow and add an accountability ping."
    elif risk_score >= 0.5:
        risk_level = "medium"
        recommendation = "Schedule earlier in the day and reduce scope by 20%."
    else:
        risk_level = "low"
        recommendation = "Maintain the current cadence; protect time on calendar."

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "factors": factors,
        "recommendation": recommendation,
    }

def calculate_success_probability(habit, logs) -> float:
    """
    Calculates the probability that the user will complete the habit tomorrow.
    Based on:
    1. Current Streak (Momentum)
    2. Consistency (Total logs / Days since creation)
    3. Failure check (Did they miss yesterday?)
    """
    base_prob = 0.5
    
    # 1. Momentum Bonus
    streak_bonus = min(habit.current_streak * 0.05, 0.3)
    
    # 2. Consistency Factor
    days_since_creation = (datetime.utcnow() - habit.created_at).days + 1
    consistency = len(logs) / days_since_creation
    # Clamp to avoid over-penalizing brand new habits
    consistency_factor = max(-0.1, min((consistency - 0.5) * 0.4, 0.2))
    
    # 3. Difficulty Penalty
    difficulty_penalty = (habit.difficulty - 1) * 0.05 # 1=0, 5=0.2 penalty
    
    prob = base_prob + streak_bonus + consistency_factor - difficulty_penalty
    
    # Clamp
    return max(0.1, min(0.95, prob))

def update_streak(habit, new_log_date: datetime):
    """
    Updates the streak for a habit based on the new log.
    Simple MVP Logic: If last log was yesterday, increment. If today, ignore. Else reset.
    """
    # This logic assumes we check this BEFORE adding the new log or check against previous logs
    # For MVP, we'll request the LAST log before this one.
    # But here, let's keep it simple: We just need to know if the streak continues.
    pass # Implementation will be inside the API logic for better DB access
