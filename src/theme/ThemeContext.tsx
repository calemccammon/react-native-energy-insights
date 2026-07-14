import React, { createContext, useContext } from 'react';
import { useAppStore } from '../store/useAppStore';
import { lightColors, darkColors, type ColorScheme } from './colors';

const ThemeContext = createContext<ColorScheme>(lightColors);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isDarkMode = useAppStore((s) => s.isDarkMode);
  return (
    <ThemeContext.Provider value={isDarkMode ? darkColors : lightColors}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ColorScheme {
  return useContext(ThemeContext);
}
