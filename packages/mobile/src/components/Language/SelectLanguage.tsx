import React, { memo, useCallback } from 'react';
import { List, Screen } from '@tonkeeper/uikit';
import { useSelectedLanguageStore } from '$store/zustand/selectedLanguage/useSelectedLanguageStore';
import RNRestart from 'react-native-restart';
import {
  detectLocale,
  nativeLocaleNames,
  SupportedLocales,
} from '@tonkeeper/shared/i18n/translations';
import { Icon } from '$uikit';
import { t } from '@tonkeeper/shared/i18n';

export const SelectLanguage = memo(() => {
  const setSelectedLanguage = useSelectedLanguageStore(
    (state) => state.actions.setSelectedLanguage,
  );
  const selectedLanguage = useSelectedLanguageStore((state) => state.selectedLanguage);

  const handleSwitchLanguage = useCallback(
    (languageKey: string) => () => {
      setSelectedLanguage(languageKey);
      RNRestart.restart();
    },
    [setSelectedLanguage],
  );

  return (
    <Screen>
      <Screen.Header title={t('language.title')} />
      <Screen.Content>
        <List>
          {['system', ...SupportedLocales].map((locale) => (
            <List.Item
              key={locale}
              onPress={handleSwitchLanguage(locale)}
              title={t(`language.languagesList.${locale}`)}
              subtitle={
                locale === 'system'
                  ? nativeLocaleNames[detectLocale(SupportedLocales, 'en')]
                  : nativeLocaleNames[locale]
              }
              rightContent={
                selectedLanguage === locale && (
                  <Icon color={'accentPrimary'} name="ic-donemark-thin-28" />
                )
              }
            />
          ))}
        </List>
      </Screen.Content>
    </Screen>
  );
});
