import { detectLocale, SupportedLocales, translations } from './translations';
import { pluralizeForRussian } from './pluralization';
import { I18nManager } from 'react-native';
import { I18n } from 'i18n-js';
import { useSelectedLanguageStore } from '@tonkeeper/mobile/src/store/zustand/selectedLanguage/useSelectedLanguageStore';

const getI18n = () => {
  I18nManager.forceRTL(false);
  I18nManager.allowRTL(false);

  const i18n = new I18n(translations);
  const selectedLocale = useSelectedLanguageStore.getState().selectedLanguage;
  i18n.locale =
    selectedLocale === 'system' ? detectLocale(SupportedLocales, 'en') : selectedLocale;
  i18n.enableFallback = true;

  i18n.pluralization.register('ru', pluralizeForRussian);

  return i18n;
};

(useSelectedLanguageStore.persist.rehydrate() as unknown as Promise<void>).then(() => {
  const selectedLocale = useSelectedLanguageStore.getState().selectedLanguage;
  if (selectedLocale !== 'system') {
    i18n.locale = selectedLocale;
  }
});

export const i18n = getI18n();

export const getLocale = () => {
  return i18n.locale;
};
