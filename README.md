# 🧠 HabitOS 

**An intelligent habit tracking application with AI-powered insights, risk prediction, and daily coaching powered by Google Gemini.**

*"Discipline is freedom."*

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API Reference](#-api-reference) • [Project Structure](#-project-structure)

</div>

---

## ✨ Features

### 📊 Core Habit Tracking
- **Create & Manage Habits** - Add daily/weekly habits with customizable difficulty levels (1-5)
- **Streak Tracking** - Automatic current and longest streak calculation
- **Completion Logging** - Log habit completions with optional mood and difficulty ratings
- **Visual Calendar** - Monthly calendar view showing completion history
- **Weekly Progress Charts** - Interactive bar charts displaying weekly activity

### 🤖 AI-Powered Intelligence

#### Predictive Analytics Engine
- **Success Probability Calculation** - Heuristic-based prediction of tomorrow's completion likelihood
- **Risk Assessment** - Multi-factor risk scoring with actionable recommendations
- **Risk Factors Analysis**: 
  - 📈 **Consistency** - Completion rate over time
  - 🔥 **Streak Momentum** - Longer streaks lower risk
  - ⏰ **Inactivity Penalty** - Days since last completion
  - 💪 **Difficulty Adjustment** - Higher difficulty increases risk

#### Gemini AI Integration
- **Daily Briefing** - Personalized morning motivation based on your habits and goals
- **Action Plan Generator** - AI-crafted daily schedule optimized for your habits
- **Goal Refinement** - Update your focus areas to personalize AI coaching

### 🎨 Modern UI/UX
- **Dark/Light Mode** - System-aware theme with manual toggle
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dashboard Summary** - At-a-glance view of total habits, success rate, and at-risk habits
- **Smooth Animations** - Polished interactions and transitions

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance async Python web framework |
| **SQLAlchemy** | ORM for database operations |
| **SQLite** | Lightweight database (easily swappable) |
| **Pydantic** | Data validation and settings management |
| **Google Generative AI** | Gemini API for AI features |
| **python-jose** | JWT token handling (auth-ready) |
| **Passlib** | Password hashing (auth-ready) |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI component library |
| **Vite** | Next-gen frontend tooling |
| **Tailwind CSS 4** | Utility-first styling |
| **Recharts** | Interactive data visualizations |
| **Lucide React** | Beautiful icon library |
| **React Markdown** | Render AI-generated content |
| **date-fns** | Date manipulation utilities |

---

## 🚀 Installation

### Prerequisites
- **Python 3.10+**
- **Node. js 18+**
- **npm** or **yarn**
- **Google Gemini API Key** (optional, for AI features)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example . env
# Edit .env and add your GEMINI_API_KEY
```

**Environment Variables** (`.env`):
```env
DATABASE_URL=sqlite: ///./habitos.db
SECRET_KEY=your-super-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```
Backend runs at: `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 📖 Usage

### Creating Your First Habit
1. Click the **"New Habit"** button in the navigation bar
2. Enter a habit title (e.g., "Morning Meditation")
3. Click **"Launch Routine"** to create

### Logging Completions
1. Find your habit card in the dashboard
2. Click the **checkmark button** to log today's completion
3. Watch your streak grow! 

### Viewing Insights
- Each habit card displays:
  - **Success Probability** - Likelihood of completing tomorrow
  - **Current Streak** - Consecutive days completed
  - **Weekly/Calendar View** - Toggle between chart and calendar

### Using AI Features
1. **Daily Briefing** - Automatically generates on page load
2. **Refine Goals** - Click to update what the AI should focus on
3. **Generate Action Plan** - Click to get a time-blocked daily schedule

---

## 📡 API Reference

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints

#### Habits

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/habits/` | List all habits |
| `POST` | `/habits/` | Create a new habit |
| `GET` | `/habits/{id}/insights` | Get AI insights for a habit |
| `POST` | `/habits/{id}/log` | Log a habit completion |
| `GET` | `/habits/dashboard/summary` | Get dashboard summary stats |

#### AI Assistant

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/assistant/daily-briefing` | Get AI-generated daily motivation |
| `POST` | `/assistant/onboarding? goals=... ` | Update user goals for AI context |
| `GET` | `/assistant/plan` | Generate AI action plan |

### Example Requests

**Create Habit:**
```bash
curl -X POST "http://localhost:8000/api/v1/habits/" \
  -H "Content-Type: application/json" \
  -d '{"title": "Exercise", "frequency": "daily", "difficulty": 3}'
```

**Get Insights:**
```bash
curl "http://localhost:8000/api/v1/habits/1/insights"
```

---

## 📁 Project Structure

```
Habit-Tracker/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── api_v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── habits.py      # Habit CRUD & insights
│   │   │   │   │   └── assistant.py   # AI endpoints
│   │   │   │   └── api.py             # Router aggregation
│   │   │   └── deps.py                # Dependency injection
│   │   ├── core/
│   │   │   └── config.py              # Settings & env vars
│   │   ���── db/
│   │   │   ├── base.py                # Model imports
│   │   │   └── session.py             # Database session
│   │   ├── engine/
│   │   │   ├── intelligence.py        # Risk & probability engine
│   │   │   └── gemini.py              # Gemini AI client
│   │   ├── models/
│   │   │   ├── base.py                # SQLAlchemy base
│   │   │   ├── habit.py               # Habit, HabitLog, PredictionLog
│   │   │   └── user.py                # User model
│   │   ├── schemas/
│   │   │   └── schemas.py             # Pydantic models
│   │   └── main.py                    # FastAPI app entry
│   ├── tests/                         # Test suite
│   ├── requirements.txt               # Python dependencies
│   └── habitos.db                     # SQLite database
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AssistantCard.jsx      # AI briefing component
│   │   │   ├── HabitCard.jsx          # Individual habit display
│   │   │   ├── HabitCalendar.jsx      # Monthly calendar view
│   │   │   ├── HabitChart.jsx         # Area chart component
│   │   │   ├── HabitWeekChart.jsx     # Weekly bar chart
│   │   │   └── ThemeToggle.jsx        # Dark/light mode toggle
│   │   ├── api. js                     # API client functions
│   │   ├── App. jsx                    # Main app component
│   │   ├── App.css                    # App styles
│   │   └── main.jsx                   # React entry point
│   ├── package.json                   # Node dependencies
│   └── vite.config. js                 # Vite configuration
│
└── README.md
```

---

## 🔮 Future Enhancements

- [ ] **User Authentication** - JWT-based auth system (infrastructure ready)
- [ ] **Habit Categories** - Organize habits by life areas
- [ ] **Reminders & Notifications** - Push notifications for habit reminders
- [ ] **Social Features** - Accountability partners and sharing
- [ ] **Advanced Analytics** - Long-term trend analysis and insights
- [ ] **Mobile App** - React Native companion app
- [ ] **Habit Templates** - Pre-built habit stacks for common goals

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ for building better habits**

*"We are what we repeatedly do. Excellence, then, is not an act, but a habit."* — Aristotle

</div>
