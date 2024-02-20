import en from './locales/tonkeeper/en.json';
import ru from './locales/tonkeeper/ru-RU.json';
import tr from './locales/tonkeeper/tr-TR.json';
import zhHans from './locales/tonkeeper/zh-Hans-CN.json';
import { findBestAvailableLanguage } from 'react-native-localize';

export const detectLocale = (supportedLocales: string[], defaultLocale: string) => {
  const localize = findBestAvailableLanguage(supportedLocales);
  return localize?.languageTag ?? defaultLocale;
};

export const translations = { ru, en, tr, 'zh-Hans': zhHans };

export const SupportedLocales = Object.keys(translations);
export const nativeLocaleNames = {
  ru: 'Русский',
  en: 'English',
  tr: 'Türkçe',
  'zh-Hans': '简体中文',
};
