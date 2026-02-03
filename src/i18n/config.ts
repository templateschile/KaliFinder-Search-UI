import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import locale files
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';

export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Español',
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Resources object for i18next
const resources = {
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
};

// Initialize i18n
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Bind i18n to react
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false, // React already escapes
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'kalifinder-language',
    },

    // Pluralization configuration
    returnEmptyString: false,
    returnObjects: false,
  });

// Export for use in components
export { i18n };

// Helper function to change language
export const changeLanguage = (language: SupportedLanguage) => {
  i18n.changeLanguage(language);
  // Update HTML lang attribute
  document.documentElement.lang = language;
  // Store preference
  localStorage.setItem('kalifinder-language', language);
};

// Helper function to get current language
export const getCurrentLanguage = (): SupportedLanguage => {
  return i18n.language as SupportedLanguage;
};

// Helper function to initialize with widget config
export const initializeI18n = (language?: string, fallbackLanguage = 'en') => {
  const lang = language || fallbackLanguage;
  if (Object.keys(SUPPORTED_LANGUAGES).includes(lang)) {
    changeLanguage(lang as SupportedLanguage);
  }
};
