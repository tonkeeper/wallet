import { findBestAvailableLanguage } from 'react-native-localize';
import { pluralizeForRussian } from './pluralization';
import { I18nManager } from 'react-native';
import { locales } from './locales';
import { I18n } from 'i18n-js';

export const FALLBACK_LANGUAGE = {
  isRTL: false,
  languageTag: 'en',
};

export enum LanguageTags {
  en = 'en',
  ru = 'ru',
}

const getI18n = () => {
  I18nManager.forceRTL(false);
  I18nManager.allowRTL(false);

  const { languageTag } = findBestAvailableLanguage(Object.keys(LanguageTags)) || FALLBACK_LANGUAGE;

  const i18n = new I18n(locales);

  i18n.locale = languageTag;
  i18n.enableFallback = true;

  i18n.pluralization.register('ru', pluralizeForRussian);

  return i18n;
};

export const i18n = getI18n();