import React, { createContext, useState, useCallback, useEffect, FC } from 'react';
import { I18nManager } from 'react-native';
import {
  findBestAvailableLanguage,
  addEventListener,
  removeEventListener,
} from 'react-native-localize';
import i18n, { Scope, TranslateOptions } from 'i18n-js';

import { FALLBACK_LANGUAGE, LanguageTags } from '$shared/constants';
import { pluralizeForRussian } from './helper';
import * as translations from './locales'

export type TranslatorFunc = (scope: Scope, options?: TranslateOptions) => string;

export const TranslatorContext = createContext(
  (scope: Scope, options?: TranslateOptions) => i18n.t(scope, options),
);

export const TranslatorProvider: FC = ({ children }) => {
  const [hasLangChanged, setHasLangChanged] = useState(false);

  const t: TranslatorFunc = useCallback(
    (scope, options?) => i18n.t(scope, options),
    [hasLangChanged],
  );

  const setI18nConfig = useCallback(() => {
    const { languageTag } =
      findBestAvailableLanguage(Object.keys(LanguageTags)) || FALLBACK_LANGUAGE;

    I18nManager.forceRTL(false);
    I18nManager.allowRTL(false);

    i18n.translations = {
      [languageTag]: translations[languageTag],
    };
    i18n.locale = languageTag;

    setHasLangChanged((prev) => !prev);
  }, []);

  useEffect(() => {
    setI18nConfig();
    addEventListener('change', setI18nConfig);
    return () => removeEventListener('change', setI18nConfig);
  }, []);

  return <TranslatorContext.Provider value={t}>{children}</TranslatorContext.Provider>;
};

i18n.pluralization.ru = pluralizeForRussian;
