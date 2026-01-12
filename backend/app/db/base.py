# Import all the models, so that Base has them before being
# imported by Alembic or used to create tables
from app.models.base import Base  # noqa
from app.models.user import User  # noqa
from app.models.habit import Habit, HabitLog, PredictionLog  # noqa
