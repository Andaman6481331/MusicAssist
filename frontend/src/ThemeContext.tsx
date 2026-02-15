import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export interface Theme {
  name: string;
  bgPrimary: string;
  bgSecondary: string;
  textMain: string;
  textDim: string;
  accentPrimary: string;
  accentSecondary: string;
  cardBg: string;
  cardBorder: string;
  headerBg1: string;
  headerBg2: string;
}

export const themes: Record<string, Theme> = {
  oceanBlue: {
    name: 'Ocean Blue (Level 1)',
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    textMain: '#f1f5f9',
    textDim: '#cbd5e1',
    accentPrimary: '#3b82f6',
    accentSecondary: '#6366f1',
    cardBg: 'rgba(255, 255, 255, 0.03)',
    cardBorder: 'rgba(59, 130, 246, 0.2)',
    headerBg1: '#1e3a8a',
    headerBg2: '#1e40af',
  },
  cityNight: {
    name: 'City Night (Level 2)',
    bgPrimary: '#020617',
    bgSecondary: '#1e1b4b',
    textMain: '#ffffff',
    textDim: '#d1d5db',
    accentPrimary: '#8b5cf6',
    accentSecondary: '#ec4899',
    cardBg: 'rgba(255, 255, 255, 0.02)',
    cardBorder: 'rgba(139, 92, 246, 0.2)',
    headerBg1: '#4c1d95',
    headerBg2: '#5b21b6',
  },
  sunsetOrange: {
    name: 'Sunset Orange (Level 3)',
    bgPrimary: '#1a0d0d',
    bgSecondary: '#2d1a1a',
    textMain: '#fff5f5',
    textDim: '#feb2b2',
    accentPrimary: '#f97316',
    accentSecondary: '#ef4444',
    cardBg: 'rgba(255, 255, 255, 0.03)',
    cardBorder: 'rgba(249, 115, 22, 0.2)',
    headerBg1: '#7c2d12',
    headerBg2: '#9a3412',
  },
  emeraldGreen: {
    name: 'Emerald City (Level 4)',
    bgPrimary: '#061a14',
    bgSecondary: '#064e3b',
    textMain: '#ecfdf5',
    textDim: '#a7f3d0',
    accentPrimary: '#10b981',
    accentSecondary: '#34d399',
    cardBg: 'rgba(255, 255, 255, 0.03)',
    cardBorder: 'rgba(16, 185, 129, 0.2)',
    headerBg1: '#064e3b',
    headerBg2: '#065f46',
  },
  galaxyVivid: {
    name: 'Galaxy Vivid (Level 5)',
    bgPrimary: '#0d0221',
    bgSecondary: '#190e4f',
    textMain: '#f5f3ff',
    textDim: '#ddd6fe',
    accentPrimary: '#d946ef',
    accentSecondary: '#a855f7',
    cardBg: 'rgba(255, 255, 255, 0.03)',
    cardBorder: 'rgba(217, 70, 239, 0.2)',
    headerBg1: '#701a75',
    headerBg2: '#86198f',
  }
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
    const savedTheme = localStorage.getItem('selectedTheme') || 'oceanBlue';
    setThemeName(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (name: string) => {
    const selectedTheme = themes[name] || themes.oceanBlue;
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', selectedTheme.bgPrimary);
    root.style.setProperty('--bg-secondary', selectedTheme.bgSecondary);
    root.style.setProperty('--text-main', selectedTheme.textMain);
    root.style.setProperty('--text-dim', selectedTheme.textDim);
    root.style.setProperty('--accent-primary', selectedTheme.accentPrimary);
    root.style.setProperty('--accent-secondary', selectedTheme.accentSecondary);
    root.style.setProperty('--card-bg', selectedTheme.cardBg);
    root.style.setProperty('--card-border', selectedTheme.cardBorder);
    root.style.setProperty('--header-bg1', selectedTheme.headerBg1);
    root.style.setProperty('--header-bg2', selectedTheme.headerBg2);
    
    // For components using book.css variables
    root.style.setProperty('--gradient-1', selectedTheme.headerBg1);
    root.style.setProperty('--gradient-2', selectedTheme.headerBg2);
    root.style.setProperty('--accent-color', selectedTheme.accentPrimary);
    root.style.setProperty('--secondary-color', selectedTheme.accentSecondary);
    
    localStorage.setItem('selectedTheme', name);
  };

  const setTheme = (name: string) => {
    setThemeName(name);
    applyTheme(name);
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeName] || themes.oceanBlue, themeName, setTheme }}>
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

