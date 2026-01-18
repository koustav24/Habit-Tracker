import { useState, useEffect } from 'react';
import { getDailyBriefing, updateUserGoals, getDayPlan } from '../api';
import { Sparkles, Edit3, MessageSquare, Loader2, CalendarClock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function AssistantCard() {
    const [briefing, setBriefing] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generatingPlan, setGeneratingPlan] = useState(false);
    const [showGoals, setShowGoals] = useState(false);
    const [goals, setGoals] = useState("");

    useEffect(() => {
        loadBriefing();
    }, []);

    const loadBriefing = async () => {
        try {
            setLoading(true);
            const data = await getDailyBriefing();
            setBriefing(data.briefing);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePlan = async () => {
        setGeneratingPlan(true);
        try {
            const data = await getDayPlan();
            setPlan(data.plan);
        } catch (e) {
            console.error(e);
        } finally {
            setGeneratingPlan(false);
        }
    }

    const handleUpdateGoals = async (e) => {
        e.preventDefault();
        try {
            await updateUserGoals(goals);
            setShowGoals(false);
            loadBriefing(); // Refresh context
        } catch (e) {
            alert("Failed to update goals");
        }
    };

    const markdownComponents = {
        strong: ({ node, ...props }) => <span className="font-extrabold text-white drop-shadow-sm px-1 bg-white/10 rounded" {...props} />,
        p: ({ node, ...props }) => <p className="mb-3 last:mb-0 text-sky-50 leading-relaxed" {...props} />,
        ul: ({ node, ...props }) => <ul className="space-y-2 my-2" {...props} />,
        li: ({ node, ...props }) => <li className="flex gap-2" {...props} />,
        blockquote: ({ node, ...props }) => (
            <div className="border-l-4 border-yellow-400 pl-4 py-2 my-4 bg-white/5 rounded-r-lg italic text-sky-100">
                {props.children}
            </div>
        )
    };

    return (
        <div className="mb-8 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden ring-1 ring-white/20">
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 flex items-start gap-5">
                <div className="p-3 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-xl shadow-lg shadow-amber-500/20 shrink-0 transform rotate-3">
                    <Sparkles size={24} className="text-white" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                Daily AI Briefing
                                <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">New</span>
                            </h2>
                        </div>
                        <button
                            onClick={() => setShowGoals(!showGoals)}
                            className="text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 border border-white/10"
                        >
                            <Edit3 size={12} />
                            {showGoals ? "Cancel" : "Refine Goals"}
                        </button>
                    </div>

                    {showGoals ? (
                        <form onSubmit={handleUpdateGoals} className="bg-black/20 p-4 rounded-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 border border-white/10">
                            <label className="block text-xs font-bold uppercase tracking-wider text-sky-200 mb-2">What should the AI focus on?</label>
                            <textarea
                                value={goals}
                                onChange={e => setGoals(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-400 outline-none placeholder:text-white/30 mb-3 text-white transition-all font-medium"
                                placeholder="E.g. I want to build muscle and read 50 pages daily..."
                                rows={3}
                                autoFocus
                            />
                            <button type="submit" className="w-full bg-white text-sky-700 font-bold py-2.5 rounded-lg hover:bg-sky-50 transition-colors shadow-lg">
                                Save Context & Regenerate
                            </button>
                        </form>
                    ) : (
                        <div className="max-w-none">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-10 gap-3 text-sky-200">
                                    <Loader2 size={24} className="animate-spin" />
                                    <span className="text-sm font-medium animate-pulse">Analyzing your habits...</span>
                                </div>
                            ) : (
                                <div className="text-lg/7 font-medium">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                        {briefing || "Ready to conquer the day?"}
                                    </ReactMarkdown>
                                </div>
                            )}

                            {!loading && !showGoals && (
                                <div className="mt-6 pt-5 border-t border-white/10">
                                    {!plan ? (
                                        <button
                                            onClick={handleGeneratePlan}
                                            disabled={generatingPlan}
                                            className="group flex items-center gap-3 text-sm font-bold bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl transition-all w-full md:w-auto"
                                        >
                                            {generatingPlan ? <Loader2 size={18} className="animate-spin" /> : <CalendarClock size={18} className="group-hover:scale-110 transition-transform" />}
                                            {generatingPlan ? "Crafting your schedule..." : "Generate Today's Action Plan"}
                                        </button>
                                    ) : (
                                        <div className="bg-black/20 rounded-xl p-5 animate-in fade-in slide-in-from-bottom-2 border border-white/5">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-sm font-bold uppercase tracking-wider text-sky-200 flex items-center gap-2">
                                                    <CalendarClock size={16} /> Suggested Schedule
                                                </h3>
                                                <button
                                                    onClick={() => setPlan(null)}
                                                    className="text-xs text-sky-300 hover:text-white hover:underline"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                            <div className="text-sm text-sky-50 leading-relaxed">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                                    {plan}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
