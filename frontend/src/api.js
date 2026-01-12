const API_URL = "http://localhost:8000/api/v1";

export async function getHabits() {
    const res = await fetch(`${API_URL}/habits/`);
    return res.json();
}

export async function createHabit(habit) {
    const res = await fetch(`${API_URL}/habits/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(habit),
    });
    return res.json();
}

export async function logHabit(habitId, data = {}) {
    const res = await fetch(`${API_URL}/habits/${habitId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, habit_id: habitId }),
    });
    if (!res.ok) {
        const err = await res.json();
        const msg = typeof err.detail === 'string'
            ? err.detail
            : JSON.stringify(err.detail);
        throw new Error(msg || "Failed to log");
    }
    return res.json();
}

export async function getHabitInsight(habitId) {
    const res = await fetch(`${API_URL}/habits/${habitId}/insights`);
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to load insight");
    }
    return res.json();
}

export async function getDashboardSummary() {
    const res = await fetch(`${API_URL}/habits/dashboard/summary`);
    return res.json();
}
