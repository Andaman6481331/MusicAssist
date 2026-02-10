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
  skyHeaven: {
    name: 'Sky Heaven',
    primary: '#E0F2FE',
    secondary: '#F8FAFC',
    accent: '#7DD3FC',
    glow: '#7dd3fcff',
    gradient1: '#0F172A',
    gradient2: '#0F172A',
    dark: '#0F172A',
    light: '#BAE6FD',
    lighter: '#E0F2FE',
  },
  nightCity: {
    name: 'Night City',
    primary: '#0F172A',
    secondary: '#7E22CE',
    accent: '#C084FC',
    glow: '#c084fcff',
    gradient1: '#1E1B4B',
    gradient2: '#6B21A8',
    dark: '#0F172A',
    light: '#E9D5FF',
    lighter: '#F3E8FF',
  },
  loFi: {
    name: 'Lo-Fi',
    primary: '#1E1B4B',
    secondary: '#4C1D95',
    accent: '#22D3EE',
    glow: '#22d3eeff',
    gradient1: '#1E1B4B',
    gradient2: '#4C1D95',
    dark: '#1E1B4B',
    light: '#A5F3FC',
    lighter: '#E2E8F0',
  },
  earthTone: {
    name: 'Earth Tone',
    primary: '#C2410C',
    secondary: '#FDFCFB',
    accent: '#78350F',
    glow: '#78350fff',
    gradient1: '#451A03',
    gradient2: '#7C2D12',
    dark: '#451A03',
    light: '#FED7AA',
    lighter: '#FDFCFB',
  },
  forestStyle: {
    name: 'Forest Style',
    primary: '#14532D',
    secondary: '#713F12',
    accent: '#4ADE80',
    glow: '#4ade80ff',
    gradient1: '#14532D',
    gradient2: '#3F6212',
    dark: '#14532D',
    light: '#86EFAC',
    lighter: '#ECFDF5',
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
