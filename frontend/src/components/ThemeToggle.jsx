import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function useTheme() {
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    );

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === "dark" ? "light" : "dark");
    };

    return { theme, toggleTheme };
}

export function ThemeToggle({ theme, toggleTheme }) {
    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors duration-200 ${theme === "dark"
                    ? "bg-slate-800 text-yellow-400 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            aria-label="Toggle Theme"
        >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
