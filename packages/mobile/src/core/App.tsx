import React, { FC } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as StoreProvider, useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components/native';

import { store } from '$store';
import { AppearanceAccents, DarkTheme, TonTheme } from '$styled';
import { AppNavigator } from '$navigation/AppNavigator';
import { ScrollPositionProvider } from '$uikit';
import { useMemo } from 'react';
import { accentSelector } from '$store/main';
import { ToastComponent } from '$uikit/Toast/new/ToastComponent';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from 'react-query';
import { PortalDestination } from '@alexzunik/rn-native-portals-reborn';
import { isAndroid } from '$utils';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { HideableAmountProvider } from '$core/HideableAmount/HideableAmountProvider';
import { BackgroundBlur } from '$core/BackgroundBlur/BackgroundBlur';

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
      <ThemeProvider {...{ theme }}>{children}</ThemeProvider>
    </View>
  );
};

const queryClient = new QueryClient();

export const App: FC = () => {
  return (
    <StoreProvider {...{ store }}>
      <ActionSheetProvider>
        <QueryClientProvider client={queryClient}>
          <TonThemeProvider>
            <SafeAreaProvider>
              <ScrollPositionProvider>
                <HideableAmountProvider>
                  <AppNavigator />
                </HideableAmountProvider>
              </ScrollPositionProvider>
              <ToastComponent />
              <BackgroundBlur />
              {isAndroid ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                  }}
                >
                  <PortalDestination name="popupPortal" />
                </View>
              ) : null}
            </SafeAreaProvider>
          </TonThemeProvider>
        </QueryClientProvider>
      </ActionSheetProvider>
    </StoreProvider>
  );
};
