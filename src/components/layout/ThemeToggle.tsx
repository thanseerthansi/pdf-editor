import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('docustudio-theme') === 'dark' ||
        (!localStorage.getItem('docustudio-theme') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('docustudio-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('docustudio-theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all duration-200 border border-transparent hover:border-slate-700 active:scale-95"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Theme"
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
    </button>
  );
};
