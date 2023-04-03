import { findBestAvailableLanguage } from 'react-native-localize';
import { pluralizeForRussian } from './pluralization';
import { I18nManager } from 'react-native';
import { locales } from './locales';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FALLBACK_LANGUAGE = {
  isRTL: false,
  languageTag: 'en',
};

export const languages = [
  {
    tag: 'en',
    enabledForProduction: true
  },
  {
    tag: 'ru',
    enabledForProduction: true,
  },
  {
    tag: 'it',
    enabledForProduction: false,
  },
]

const getI18n = () => {
  I18nManager.forceRTL(false);
  I18nManager.allowRTL(false);
  const forcedLanguage = 'it';

  const { languageTag } = findBestAvailableLanguage(languages.filter(lang => lang.enabledForProduction).map(lang => lang.tag)) || FALLBACK_LANGUAGE;

  const i18n = new I18n(locales);

  i18n.locale = forcedLanguage || languageTag;
  i18n.enableFallback = true;

  i18n.pluralization.register('ru', pluralizeForRussian);

  return i18n;
};

export const getLocale = () => {
  return i18n.locale;
}

export const i18n = getI18n();

async function updateLocaleFromStorage() {
  const store = await AsyncStorage.getItem('devFeaturesToggle');
  const devLanguage = store && JSON.parse(store).state.devLanguage;
  if (devLanguage) {
    i18n.locale = devLanguage;
  }
}

updateLocaleFromStorage();
