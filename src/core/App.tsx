import React, { FC, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as StoreProvider, useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components/native';
import appsFlyer from 'react-native-appsflyer';

import { TranslatorProvider } from '$translation';
import { store } from '$store';
import { AppearanceAccents, DarkTheme, TonTheme } from '$styled';
import { AppNavigator } from '$navigation/AppNavigator';
import { Toast, ScrollPositionProvider } from '$uikit';
import { trackEvent } from '$utils';
import { useMemo } from 'react';
import { accentSelector } from '$store/main';
import { ToastComponent } from '$uikit/Toast/new/ToastComponent';
import { View } from 'react-native';

let onInstallConversionDataCanceller: any = appsFlyer.onInstallConversionData((res) => {
  if (JSON.parse(res.data.is_first_launch) === true) {
    trackEvent('first_launch');
    if (res.data.af_status === 'Non-organic') {
      const media_source = res.data.media_source;
      const campaign = res.data.campaign;
      trackEvent('non_organic_install', {
        media_source,
        campaign,
      });
    } else if (res.data.af_status === 'Organic') {
      trackEvent('organic_install');
    }
  }
});

let onAppOpenAttributionCanceller: any = appsFlyer.onAppOpenAttribution((res) => {
  console.log('Appsflyer', res);
});

const TonThemeProvider: FC = ({ children }) => {
  const accent = useSelector(accentSelector);

  const accentColors = AppearanceAccents[accent].colors;

  const theme = useMemo(
    (): TonTheme => ({
      ...DarkTheme,
      colors: { ...DarkTheme.colors, ...accentColors },
    }),
    [accentColors],
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.backgroundPrimary }}>
      <ThemeProvider {...{ theme }}>
        {children}
      </ThemeProvider>
    </View>
  );
};

export const App: FC = () => {
  useEffect(() => {
    trackEvent('launch_app');
  }, []);

  useEffect(() => {
    return () => {
      if (onInstallConversionDataCanceller) {
        onInstallConversionDataCanceller();
        onInstallConversionDataCanceller = null;
      }
      if (onAppOpenAttributionCanceller) {
        onAppOpenAttributionCanceller();
        onAppOpenAttributionCanceller = null;
      }
    };
  });

  return (
    <SafeAreaProvider>
      <TranslatorProvider>
        <StoreProvider {...{ store }}>
          <TonThemeProvider>
            <ScrollPositionProvider>
              <AppNavigator />
            </ScrollPositionProvider>
            <Toast />
            <ToastComponent />
          </TonThemeProvider>
        </StoreProvider>
      </TranslatorProvider>
    </SafeAreaProvider>
  );
};
