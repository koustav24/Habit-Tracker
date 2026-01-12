import React, { useEffect, useState } from 'react';
import { logHabit, getHabitInsight } from '../api';
import { CheckCircle, AlertTriangle, TrendingUp, Zap, Calendar as CalendarIcon, BarChart2 } from 'lucide-react';
import { HabitCalendar } from './HabitCalendar';
import { HabitWeekChart } from './HabitWeekChart';

export function HabitCard({ habit, onUpdate }) {
    const [insight, setInsight] = useState(null);
    const [loadingInsight, setLoadingInsight] = useState(true);
    const [viewMode, setViewMode] = useState('week'); // 'week' | 'calendar'

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const data = await getHabitInsight(habit.id);
                if (mounted) setInsight(data);
            } catch (e) {
                console.error(e);
            } finally {
                if (mounted) setLoadingInsight(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [habit.id]);

    const handleLog = async () => {
        try {
            await logHabit(habit.id);
            // Quick optimistic UI update could go here, but for now we refresh
            const updatedInsight = await getHabitInsight(habit.id);
            setInsight(updatedInsight);
            onUpdate();
        } catch (e) {
            console.error(e);
            alert("Could not log habit: " + e.message);
        }
    };

    const getProbColor = (prob) => {
        if (prob >= 0.8) return "text-emerald-500 dark:text-emerald-400";
        if (prob >= 0.5) return "text-amber-500 dark:text-amber-400";
        return "text-rose-500 dark:text-rose-400";
    };

    const getProbBg = (prob) => {
        if (prob >= 0.8) return "bg-emerald-50 dark:bg-emerald-900/20 ring-emerald-500/20";
        if (prob >= 0.5) return "bg-amber-50 dark:bg-amber-900/20 ring-amber-500/20";
        return "bg-rose-50 dark:bg-rose-900/20 ring-rose-500/20";
    }

    const currentProb = insight?.success_probability ?? habit.success_probability;
    const history = insight?.history || [];

    return (
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all duration-300">
            {/* Top Row: Title & Probability Badge */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {habit.title}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                            {habit.frequency}
                        </span>
                        {habit.description && <span>• {habit.description}</span>}
                    </p>
                </div>

                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ring-1 ${getProbBg(currentProb)}`}>
                    <TrendingUp size={14} className={getProbColor(currentProb)} />
                    <span className={`text-sm font-bold ${getProbColor(currentProb)}`}>
                        {Math.round(currentProb * 100)}%
                    </span>
                </div>
            </div>

            {/* Middle: Recommendation/Insight */}
            <div className="mb-6">
                <div className="min-h-[24px] mb-4">
                    {loadingInsight ? (
                        <div className="h-4 w-3/4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                    ) : insight && (
                        <div className="flex items-start gap-2">
                            {insight.risk_level === 'high' ? (
                                <AlertTriangle size={16} className="text-rose-500 mt-0.5 shrink-0" />
                            ) : (
                                <Zap size={16} className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                            )}
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">
                                {insight.recommendation}
                            </p>
                        </div>
                    )}
                </div>

                {/* VISUALIZATION TOGGLE & AREA */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-end mb-2 gap-2">
                        <button
                            onClick={() => setViewMode('week')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'week' ? 'bg-white dark:bg-slate-800 shadow text-brand-500' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Week View"
                        >
                            <BarChart2 size={14} />
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-800 shadow text-brand-500' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Month Calendar"
                        >
                            <CalendarIcon size={14} />
                        </button>
                    </div>

                    <div className="min-h-[120px]">
                        {!insight ? (
                            <div className="h-24 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                        ) : viewMode === 'week' ? (
                            <HabitWeekChart logs={history} color={currentProb >= 0.8 ? '#10b981' : currentProb >= 0.5 ? '#f59e0b' : '#f43f5e'} />
                        ) : (
                            <HabitCalendar logs={history} />
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom: Streak & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Streak</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {habit.current_streak}
                        </span>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">days</span>
                    </div>
                </div>

                <button
                    onClick={handleLog}
                    className="flex items-center gap-2 bg-slate-900 dark:bg-slate-100 hover:bg-brand-600 dark:hover:bg-white text-white dark:text-slate-900 hover:text-white dark:hover:text-brand-600 px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-slate-900/10 dark:shadow-none"
                >
                    <CheckCircle size={18} />
                    <span>Done</span>
                </button>
            </div>
        </div>
    );
}
