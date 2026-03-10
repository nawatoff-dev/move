import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'modern';

export interface Settings {
  theme: Theme;
  primaryColor: string;
  fontSize: number;
  fontStyle: string;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  primaryColor: '#10b981', // emerald-500
  fontSize: 16,
  fontStyle: 'Inter',
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
  restorePreviousSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('zzia_settings') || localStorage.getItem('prop_trader_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [previousSettings, setPreviousSettings] = useState<Settings | null>(null);

  useEffect(() => {
    localStorage.setItem('zzia_settings', JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  const applySettings = (s: Settings) => {
    const root = document.documentElement;
    
    // Theme
    if (s.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('modern');
      root.style.setProperty('--brand-dark', '#f8fafc');
      root.style.setProperty('--brand-surface', '#ffffff');
      root.style.setProperty('--brand-border', '#e2e8f0');
      root.style.setProperty('--text-main', '#0f172a');
      root.style.setProperty('--text-muted', '#64748b');
      root.style.setProperty('--text-inverse', '#ffffff');
    } else if (s.theme === 'modern') {
      root.classList.remove('light');
      root.classList.add('modern');
      root.style.setProperty('--brand-dark', '#0f1115');
      root.style.setProperty('--brand-surface', '#1a1d23');
      root.style.setProperty('--brand-border', '#2d333d');
      root.style.setProperty('--text-main', '#e2e8f0');
      root.style.setProperty('--text-muted', '#94a3b8');
      root.style.setProperty('--text-inverse', '#000000');
    } else {
      root.classList.remove('light');
      root.classList.remove('modern');
      root.style.setProperty('--brand-dark', '#0A0A0A');
      root.style.setProperty('--brand-surface', '#141414');
      root.style.setProperty('--brand-border', '#1A1A1A');
      root.style.setProperty('--text-main', '#ffffff');
      root.style.setProperty('--text-muted', '#71717a');
      root.style.setProperty('--text-inverse', '#000000');
    }

    // Primary Color
    root.style.setProperty('--brand-primary', s.primaryColor);
    
    // Font Size
    root.style.fontSize = `${s.fontSize}px`;
    
    // Font Style
    // Quote font families with spaces
    const fontStyle = s.fontStyle.includes(' ') ? `"${s.fontStyle}"` : s.fontStyle;
    root.style.setProperty('--font-family-main', fontStyle);
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setPreviousSettings(settings);
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setPreviousSettings(settings);
    setSettings(DEFAULT_SETTINGS);
  };

  const restorePreviousSettings = () => {
    if (previousSettings) {
      setSettings(previousSettings);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings, restorePreviousSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
