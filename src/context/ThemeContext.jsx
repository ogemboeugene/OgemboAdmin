import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [fontSize, setFontSize] = useState('medium');

  // Load theme settings from localStorage on mount
  useEffect(() => {
    const loadThemeSettings = () => {
      // Check for existing settings in developerSettings
      const developerSettings = localStorage.getItem('developerSettings');
      if (developerSettings) {
        try {
          const parsed = JSON.parse(developerSettings);
          if (parsed.darkMode !== undefined) {
            setDarkMode(parsed.darkMode);
          }
          if (parsed.primaryColor) {
            setPrimaryColor(parsed.primaryColor);
          }
          if (parsed.fontSize) {
            setFontSize(parsed.fontSize);
          }
        } catch (error) {
          console.error('Error parsing developer settings:', error);
        }
      } else {
        // Fallback to old darkMode localStorage key
        const oldDarkMode = localStorage.getItem('darkMode');
        if (oldDarkMode === 'true') {
          setDarkMode(true);
        } else {
          // Check system preference if no saved setting
          const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setDarkMode(prefersDarkMode);
        }
      }
    };

    loadThemeSettings();
  }, []);

  // Apply theme changes to DOM and localStorage
  useEffect(() => {
    // Apply dark mode to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Apply primary color as CSS variable
    document.documentElement.style.setProperty('--primary-color', primaryColor);

    // Apply font size
    let rootFontSize = '16px';
    if (fontSize === 'small') rootFontSize = '14px';
    if (fontSize === 'large') rootFontSize = '18px';
    document.documentElement.style.fontSize = rootFontSize;

    // Update localStorage - both formats for compatibility
    localStorage.setItem('darkMode', darkMode.toString());
    
    // Update developer settings
    const existingSettings = localStorage.getItem('developerSettings');
    let settings = {};
    
    if (existingSettings) {
      try {
        settings = JSON.parse(existingSettings);
      } catch (error) {
        console.error('Error parsing existing settings:', error);
      }
    }
    
    const updatedSettings = {
      ...settings,
      darkMode,
      primaryColor,
      fontSize
    };
    
    localStorage.setItem('developerSettings', JSON.stringify(updatedSettings));
  }, [darkMode, primaryColor, fontSize]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const value = {
    darkMode,
    setDarkMode,
    toggleDarkMode,
    primaryColor,
    setPrimaryColor,
    fontSize,
    setFontSize
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
