import React, { useCallback, useEffect, useState } from 'react';
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
import { BackgroundBlur } from '$core/BackgroundBlur/BackgroundBlur';
import * as SplashScreen from 'expo-splash-screen';

import {
  TonAPIProvider,
  WalletCurrency,
  WalletKind,
  WalletNetwork,
} from '@tonkeeper/core';
import { tk, tonapi } from '@tonkeeper/shared/tonkeeper';

import { queryClient } from '@tonkeeper/shared/queryClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const migrate = async () => {
  try {
    const rawData = await AsyncStorage.getItem('mainnet_default_wallet');
    if (!rawData) {
      return;
    }

    const oldCurrency = await AsyncStorage.getItem('mainnet_default_primary_currency');
    const currency = WalletCurrency[oldCurrency?.toUpperCase() ?? 'USD'];

    const data = JSON.parse(rawData);
    const wallet = {
      pubkey: data.vault.tonPubkey,
      network: WalletNetwork.mainnet,
      kind: WalletKind.Regular,
      currency,
    };

    await AsyncStorage.setItem('current_pubkey', data.vault.tonPubkey);
    await AsyncStorage.setItem('wallets', JSON.stringify([wallet]));
    await AsyncStorage.removeItem('mainnet_default_wallet');
  } catch (err) {
    console.log('error migrate', err);
  }
};

SplashScreen.preventAutoHideAsync();

export function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await migrate();
        await tk.init();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StoreProvider {...{ store }}>
        <ActionSheetProvider>
          <QueryClientProvider client={queryClient}>
            <TonAPIProvider tonapi={tonapi}>
              <TonThemeProvider>
                <SafeAreaProvider>
                  <ScrollPositionProvider>
                    <HideableAmountProvider>
                      <AppNavigator />
                    </HideableAmountProvider>
                  </ScrollPositionProvider>
                  {/* <MobilePasscodeScreen locked={tonkeeper.securitySettings.locked} /> */}
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
            </TonAPIProvider>
          </QueryClientProvider>
        </ActionSheetProvider>
      </StoreProvider>
    </View>
  );
}
