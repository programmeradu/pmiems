import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { enHelpTranslations, frHelpTranslations, arHelpTranslations } from './help-translations';

// Import locale files
import enTranslationsFile from './locales/en.json';
import frTranslationsFile from './locales/fr.json';
import arTranslationsFile from './locales/ar.json';

// Create the merged translations including help content
const mergedEnTranslations = {
  ...enTranslationsFile,
  help: {
    ...enHelpTranslations
  }
};

const mergedFrTranslations = {
  ...frTranslationsFile,
  help: {
    ...frHelpTranslations
  }
};

const mergedArTranslations = {
  ...arTranslationsFile,
  help: {
    ...arHelpTranslations
  }
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: mergedEnTranslations,
      },
      fr: {
        translation: mergedFrTranslations,
      },
      ar: {
        translation: mergedArTranslations,
      },
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;