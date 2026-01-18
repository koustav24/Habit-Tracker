import { useState, useEffect } from 'react'
import { getHabits, createHabit, getDashboardSummary } from './api'
import { HabitCard } from './components/HabitCard'
import { AssistantCard } from './components/AssistantCard'
import { useTheme, ThemeToggle } from './components/ThemeToggle'
import { LayoutDashboard, Plus, Activity, AlertCircle, CheckCircle2 } from 'lucide-react'

function App() {
  const [habits, setHabits] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newHabit, setNewHabit] = useState({ title: '', frequency: 'daily' })
  const [summary, setSummary] = useState(null)

  const { theme, toggleTheme } = useTheme();

  const refresh = async () => {
    try {
      const [habitsData, summaryData] = await Promise.all([
        getHabits(),
        getDashboardSummary()
      ])
      setHabits(habitsData)
      setSummary(summaryData)
    } catch (e) {
      console.error("Failed to fetch data:", e)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createHabit(newHabit)
    setShowForm(false)
    setNewHabit({ title: '', frequency: 'daily' })
    refresh()
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-sky-500/30">

      {/* Navigation / Header */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-300 dark:border-slate-800/50 shadow-sm dark:shadow-none">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-600 dark:bg-sky-500 rounded-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">HabitOS</span>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md shadow-sky-500/20 active:translate-y-0.5"
            >
              <Plus size={18} />
              <span>New Habit</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">

        <AssistantCard />

        {/* Dashboard Stats */}
        {summary && (
          <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={<LayoutDashboard size={20} className="text-sky-600 dark:text-sky-500" />}
              label="Total Habits"
              value={summary.total_habits}
              subtext="Active routines"
            />
            <StatCard
              icon={<CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-500" />}
              label="Avg Success Rate"
              value={`${Math.round(summary.avg_success_probability * 100)}%`}
              subtext="Daily completion probability"
            />
            <StatCard
              icon={<AlertCircle size={20} className="text-amber-600 dark:text-amber-500" />}
              label="At Risk"
              value={summary.at_risk.length}
              subtext="Need attention"
              highlight={summary.at_risk.length > 0}
            />
          </section>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="mb-10 p-1 bg-gradient-to-br from-sky-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl shadow-sky-500/10 animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <Plus size={20} className="text-sky-600 dark:text-sky-500" /> Create New Routine
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={newHabit.title}
                    onChange={e => setNewHabit({ ...newHabit, title: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white font-medium"
                    placeholder="e.g. Deep Work Session"
                    required
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-sky-600 text-white rounded-lg font-bold hover:bg-sky-700 transition-colors shadow-lg shadow-sky-500/30"
                  >
                    Launch Routine
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Habit Grid */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-sky-600 dark:text-sky-500" size={24} />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your System</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {habits.map(habit => (
              <HabitCard key={habit.id} habit={habit} onUpdate={refresh} />
            ))}

            {habits.length === 0 && (
              <div className="col-span-full py-32 text-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 mb-4">
                  <Plus size={32} className="text-slate-500 dark:text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No habits active</h3>
                <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-6 text-sky-600 dark:text-sky-400 font-bold hover:underline"
                >
                  Start your first habit
                </button>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  )
}

function StatCard({ icon, label, value, subtext, highlight }) {
  return (
    <div className={`p-6 rounded-2xl border transition-all duration-300 ${highlight
      ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30'
      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700/50'
      } shadow-sm hover:shadow-md`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${highlight ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700/50'
          }`}>
          {icon}
        </div>
        {highlight && <span className="text-xs font-bold px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">ACTION</span>}
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</span>
        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mt-1">{label}</span>
        <span className="text-xs text-slate-500 dark:text-slate-500 mt-2 font-medium">{subtext}</span>
      </div>
    </div>
  )
}

export default App
