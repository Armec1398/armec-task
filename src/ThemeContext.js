import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './theme';

const ThemeContext = createContext({ theme: lightTheme, toggle: () => {}, isDark: false });

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('armec_theme').then((v) => {
      if (v === 'dark') setIsDark(true);
      else if (v === 'light') setIsDark(false);
    });
  }, []);

  function toggle() {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem('armec_theme', next ? 'dark' : 'light');
      return next;
    });
  }

  const theme = isDark ? darkTheme : lightTheme;
  return <ThemeContext.Provider value={{ theme, toggle, isDark }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
