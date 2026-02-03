import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  i18n,
  changeLanguage,
  getCurrentLanguage,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '../i18n/config';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  changeLanguage: (language: SupportedLanguage) => void;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// RTL languages list
const RTL_LANGUAGES: SupportedLanguage[] = [];

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(getCurrentLanguage());
  const [isRTL, setIsRTL] = useState(RTL_LANGUAGES.includes(currentLanguage));

  const handleChangeLanguage = (language: SupportedLanguage) => {
    changeLanguage(language);
    setCurrentLanguage(language);
    setIsRTL(RTL_LANGUAGES.includes(language));
    // Update both document and shadow DOM HTML lang attributes
    document.documentElement.lang = language;

    // Also update shadow DOM if it exists
    const shadowRoots = document.querySelectorAll('*');
    shadowRoots.forEach((element) => {
      if ((element as any).shadowRoot) {
        const shadowRoot = (element as any).shadowRoot;
        const htmlElement = shadowRoot.querySelector('html') || shadowRoot.host;
        htmlElement.setAttribute('lang', language);
      }
    });
  };

  useEffect(() => {
    // Initialize HTML lang attribute on mount
    document.documentElement.lang = currentLanguage;

    // Listen for language changes from i18n
    const handleLanguageChanged = (lng: string) => {
      if (Object.keys(SUPPORTED_LANGUAGES).includes(lng)) {
        setCurrentLanguage(lng as SupportedLanguage);
        setIsRTL(RTL_LANGUAGES.includes(lng as SupportedLanguage));
        document.documentElement.lang = lng;
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [currentLanguage]);

  const value: LanguageContextType = {
    currentLanguage,
    changeLanguage: handleChangeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isRTL,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
