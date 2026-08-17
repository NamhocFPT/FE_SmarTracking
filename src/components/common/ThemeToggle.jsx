import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
    const [theme, setTheme] = useState(() => {
        // Initialize theme from localStorage or system setting
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) return storedTheme;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return systemPrefersDark ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng'}
            className="p-2 rounded-lg text-slate-blue hover:text-midnight-indigo hover:bg-cloud-mist hover-lift transition-all duration-300 flex items-center justify-center border-0 bg-transparent cursor-pointer focus:outline-none"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 transition-transform duration-500 rotate-0 hover:rotate-12" />
            ) : (
                <Sun className="w-5 h-5 text-sunset-gold transition-transform duration-500 rotate-0 hover:scale-110" />
            )}
        </button>
    );
};

export default ThemeToggle;
