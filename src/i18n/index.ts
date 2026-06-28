import { tr } from './tr';
import { en } from './en';

export const translations = { tr, en };
export type Language = 'tr' | 'en';
export type TranslationKeys = keyof typeof tr;

export const getTranslation = (lang: Language, key: TranslationKeys): string => {
  const dictionary = translations[lang] || translations.tr;
  return dictionary[key] || tr[key] || String(key);
};
