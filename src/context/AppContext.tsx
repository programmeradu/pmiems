import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// Define the shape of our context
interface AppContextType {
  language: string;
  setLanguage: (lang: string) => void;
  direction: 'ltr' | 'rtl';
  isRTL: boolean;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Props for our provider
interface AppContextProviderProps {
  children: ReactNode;
}

/**
 * App Context Provider component that manages global app state
 */
export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  
  // Initialize language from localStorage or default to browser language
  const [language, setLanguageState] = useState<string>(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) return savedLanguage;
    
    // Get browser language (first 2 chars)
    const browserLang = navigator.language.split('-')[0];
    
    // Check if we support the browser language, default to 'en' if not
    return ['en', 'fr', 'ar'].includes(browserLang) ? browserLang : 'en';
  });
  
  // Direction based on language
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(
    language === 'ar' ? 'rtl' : 'ltr'
  );
  
  const isRTL = direction === 'rtl';
  
  // Set language and save to localStorage
  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
  };
  
  // Update direction when language changes
  useEffect(() => {
    const newDirection = language === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    document.documentElement.dir = newDirection;
    document.body.dir = newDirection;
  }, [language]);
  
  // Initialize i18n with saved language
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [i18n, language]);
  
  return (
    <AppContext.Provider value={{ language, setLanguage, direction, isRTL }}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Custom hook to use app context
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  return context;
};