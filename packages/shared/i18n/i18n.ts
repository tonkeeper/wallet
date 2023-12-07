import { findBestAvailableLanguage } from 'react-native-localize';
import { SupportedLocales, translations } from './translations';
import { pluralizeForRussian } from './pluralization';
import { I18nManager } from 'react-native';
import { I18n } from 'i18n-js';

const detectLocale = (supportesLocales: string[], defaultLocale: string) => {
  const localize = findBestAvailableLanguage(supportesLocales);
  return localize?.languageTag ?? defaultLocale;
};

const getI18n = () => {
  I18nManager.forceRTL(false);
  I18nManager.allowRTL(false);

  const i18n = new I18n(translations);

  i18n.locale = detectLocale(SupportedLocales, 'en');
  i18n.enableFallback = true;

  i18n.pluralization.register('ru', pluralizeForRussian);

  return i18n;
};

export const i18n = getI18n();

export const getLocale = () => {
  return i18n.locale;
};


