import React from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    getDay,
    addDays,
    startOfWeek,
    endOfWeek
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function HabitCalendar({ logs, color }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    // Start week on Monday (1)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const completedDates = logs.map(l => new Date(l));

    const isCompleted = (day) => {
        return completedDates.some(d => isSameDay(d, day));
    };

    // Header Days (Mon, Tue...)
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, dateFormat);
            const cloneDay = day;

            const completed = isCompleted(cloneDay);
            const isCurrentMonth = isSameMonth(day, monthStart);

            days.push(
                <div
                    className={`
                    relative h-8 w-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all
                    ${!isCurrentMonth ? "text-slate-300 dark:text-slate-600" : "text-slate-700 dark:text-slate-300"}
                    ${completed ? `bg-sky-500 text-white font-bold shadow-sm shadow-sky-500/30` : ""}
                    ${!completed && isCurrentMonth ? "bg-slate-50 dark:bg-slate-800" : ""}
                `}
                    key={day}
                >
                    {formattedDate}
                    {completed && (
                        <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-sky-400/20"></span>
                    )}
                </div>
            );
            day = addDays(day, 1);
        }
        rows.push(
            <div className="grid grid-cols-7 gap-1.5 mb-1.5" key={day}>
                {days}
            </div>
        );
        days = [];
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    {format(currentDate, "MMMM yyyy")}
                </h4>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><ChevronLeft size={16} /></button>
                    <button onClick={nextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><ChevronRight size={16} /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 mb-2">
                {weekDays.map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {d}
                    </div>
                ))}
            </div>
            <div>{rows}</div>
        </div>
    );
}
