import en from './locales/tonkeeper/en.json';
import ru from './locales/tonkeeper/ru-RU.json';
import tr from './locales/tonkeeper/tr-TR.json';
import zhHans from './locales/tonkeeper/zh-Hans-CN.json';
import id from './locales/tonkeeper/id.json';
import uk from './locales/tonkeeper/uk.json';
import uz from './locales/tonkeeper/uz.json';
import { findBestAvailableLanguage } from 'react-native-localize';

export const detectLocale = (supportedLocales: string[], defaultLocale: string) => {
  const localize = findBestAvailableLanguage(supportedLocales);
  return localize?.languageTag ?? defaultLocale;
};

export const translations = { ru, en, tr, 'zh-Hans': zhHans, uz, id, uk };

export const SupportedLocales = Object.keys(translations);
export const nativeLocaleNames = {
  ru: 'Русский',
  en: 'English',
  tr: 'Türkçe',
  uk: 'Українська',
  uz: 'O‘zbekcha',
  id: 'Bahasa Indonesia',
  'zh-Hans': '简体中文',
};
