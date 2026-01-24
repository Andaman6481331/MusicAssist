import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  gradient1: string;
  gradient2: string;
  dark: string;
  light: string;
  lighter: string;
}

export const themes: Record<string, Theme> = {
  oceanBlue: {
    name: 'Ocean Blue',
    primary: '#1a58b0',
    secondary: '#1da1f2',
    accent: '#4489f9',
    glow: '#5593f7ff',
    gradient1: '#0a2f5c',
    gradient2: '#144387',
    dark: '#0a2f5c',
    light: '#a8cdfd',
    lighter: '#b2d3fe',
  },
  sunsetOrange: {
    name: 'Sunset Orange',
    primary: '#d97706',
    secondary: '#f97316',
    accent: '#fb923c',
    glow: '#fca5a5ff',
    gradient1: '#7c2d12',
    gradient2: '#b45309',
    dark: '#5a1f0b',
    light: '#fed7aa',
    lighter: '#fff1e0',
  },
  midnightPurple: {
    name: 'Midnight Purple',
    primary: '#7c3aed',
    secondary: '#a78bfa',
    accent: '#c084fc',
    glow: '#d8b4feff',
    gradient1: '#2e1065',
    gradient2: '#5b21b6',
    dark: '#1e1b4b',
    light: '#ede9fe',
    lighter: '#f3e8ff',
  },
  forestGreen: {
    name: 'Forest Green',
    primary: '#059669',
    secondary: '#10b981',
    accent: '#34d399',
    glow: '#6ee7b7ff',
    gradient1: '#064e3b',
    gradient2: '#047857',
    dark: '#064e3b',
    light: '#bbf7d0',
    lighter: '#e6fffa',
  },
  rosePink: {
    name: 'Rose Pink',
    primary: '#e11d48',
    secondary: '#f43f5e',
    accent: '#fb7185',
    glow: '#fda4afff',
    gradient1: '#500724',
    gradient2: '#a3072a',
    dark: '#3f0a17',
    light: '#ffdde1',
    lighter: '#fff1f2',
  },
  deepTeal: {
    name: 'Deep Teal',
    primary: '#0d9488',
    secondary: '#14b8a6',
    accent: '#2dd4bf',
    glow: '#5eead4ff',
    gradient1: '#0f172a',
    gradient2: '#134e4a',
    dark: '#0f172a',
    light: '#78f4e1',
    lighter: '#e6fffa', 
  },
};

interface ThemeContextType {
  theme: Theme;
  themeName: string;
  setTheme: (themeName: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<string>('oceanBlue');

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('selectedTheme') || 'oceanBlue';
    setThemeName(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (name: string) => {
    const selectedTheme = themes[name];
    if (selectedTheme) {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', selectedTheme.primary);
      root.style.setProperty('--secondary-color', selectedTheme.secondary);
      root.style.setProperty('--accent-color', selectedTheme.accent);
      root.style.setProperty('--glow-color', selectedTheme.glow);
      root.style.setProperty('--gradient-1', selectedTheme.gradient1);
      root.style.setProperty('--gradient-2', selectedTheme.gradient2);
      root.style.setProperty('--dark-color', selectedTheme.dark);
      root.style.setProperty('--dark-color', selectedTheme.dark);
      root.style.setProperty('--light-color', selectedTheme.light);
      root.style.setProperty('--lighter-color', selectedTheme.lighter);
      localStorage.setItem('selectedTheme', name);
    }
  };

  const setTheme = (name: string) => {
    setThemeName(name);
    applyTheme(name);
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeName], themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
