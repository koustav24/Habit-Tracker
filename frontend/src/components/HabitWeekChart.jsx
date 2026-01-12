import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns';

export function HabitWeekChart({ logs, color }) {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

    const days = eachDayOfInterval({ start, end });
    const completedDates = logs.map(l => new Date(l));

    const data = days.map(day => {
        const isCompleted = completedDates.some(d => isSameDay(d, day));
        return {
            name: format(day, 'EEE'), // Mon, Tue
            completed: isCompleted ? 1 : 0,
            fullDate: format(day, "MMM d"),
            isToday: isSameDay(day, now)
        };
    });

    return (
        <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        dy={5}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-slate-800 text-white text-xs py-1 px-2 rounded shadow-lg">
                                        <p>{`${payload[0].payload.fullDate}`}</p>
                                        <p>{payload[0].value ? "Completed" : "Missed"}</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="completed" radius={[4, 4, 4, 4]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.completed ? (color || '#0ea5e9') : '#e2e8f0'}
                                fillOpacity={entry.completed ? 1 : 0.3}
                                className={entry.isToday && !entry.completed ? "animate-pulse" : ""}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
