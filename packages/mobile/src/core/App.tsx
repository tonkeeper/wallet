import React from 'react';
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
import { QueryClientProvider } from 'react-query';
import { PortalDestination } from '@alexzunik/rn-native-portals-reborn';
import { isAndroid } from '$utils';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { HideableAmountProvider } from '$core/HideableAmount/HideableAmountProvider';

import { queryClient } from '@tonkeeper/shared/queryClient';
import { WalletProvider } from '../context';
import { BlockingLoaderView } from '@tonkeeper/uikit';

const TonThemeProvider = ({ children }) => {
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

export function App() {
  return (
    // <KeyboardProvider>
    <WalletProvider>
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
                {/* <MobilePasscodeScreen locked={tonkeeper.securitySettings.locked} /> */}
                <ToastComponent />
                <BlockingLoaderView />
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
    </WalletProvider>
    // </KeyboardProvider>
  );
}
