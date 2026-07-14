'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('studyflow-theme') as Theme | null;
    const initial = stored || 'dark';
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    
    const updateDOM = () => {
      setTheme(next);
      localStorage.setItem('studyflow-theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
    };

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      document.documentElement.classList.add('theme-transitioning');
      const transition = (document as any).startViewTransition(updateDOM);
      transition.finished.finally(() => {
        document.documentElement.classList.remove('theme-transitioning');
      });
    } else {
      updateDOM();
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
