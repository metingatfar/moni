import React, { createContext, useContext, useState, useEffect } from 'react';

interface LayoutContextType {
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isDesktop: boolean;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
  activeRightTab: string;
  setActiveRightTab: (tab: string) => void;
  showCommandPalette: boolean;
  setShowCommandPalette: (val: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('today');
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWidth(window.innerWidth);
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isTablet = width >= 768 && width < 992;
  const isLaptop = width >= 992 && width < 1440;
  const isDesktop = width >= 1440;

  return (
    <LayoutContext.Provider value={{
      width,
      isMobile,
      isTablet,
      isLaptop,
      isDesktop,
      isSidebarCollapsed,
      setSidebarCollapsed,
      activeRightTab,
      setActiveRightTab,
      showCommandPalette,
      setShowCommandPalette
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) throw new Error('useLayout must be used within LayoutProvider');
  return context;
};
