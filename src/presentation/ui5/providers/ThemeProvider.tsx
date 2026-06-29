import React, { createContext, useContext, useState, useEffect } from 'react';
import { colors } from '../tokens/colors';

interface ThemeContextType {
  isDark: boolean;
  isHighContrast: boolean;
  toggleTheme: () => void;
  toggleHighContrast: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('moni_ui5_dark') !== 'false' : true));
  const [isHighContrast, setIsHighContrast] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('moni_ui5_high_contrast') === 'true' : false));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('moni_ui5_dark', String(isDark));
    localStorage.setItem('moni_ui5_high_contrast', String(isHighContrast));

    // Update document element attributes
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [isDark, isHighContrast]);

  const toggleTheme = () => setIsDark(prev => !prev);
  const toggleHighContrast = () => setIsHighContrast(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, isHighContrast, toggleTheme, toggleHighContrast }}>
      <div 
        style={{
          backgroundColor: isDark ? colors.background.base : '#ffffff',
          color: isDark ? colors.text.primary : '#1f2937',
          minHeight: '100vh',
          fontFamily: 'Inter, sans-serif',
          transition: 'background-color 0.3s ease, color 0.3s ease'
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
