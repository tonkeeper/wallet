import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as StoreProvider, useSelector } from 'react-redux';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';

import { store } from '$store';
import {
  AccentKey,
  AppearanceAccents,
  BlueTheme,
  DarkTheme,
  LightTheme,
  TonTheme,
} from '$styled';
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
import { BlockingLoaderView, ThemeName, ThemeProvider } from '@tonkeeper/uikit';
import { getThemeByName } from '@tonkeeper/uikit/src/styles/utils';
import { useThemeName } from '$hooks/useThemeName';

const getLegacyThemeByName = (name: ThemeName): TonTheme => {
  const uikitTheme = getThemeByName(name);

  if (name === ThemeName.Dark) {
    return { ...DarkTheme, colors: { ...DarkTheme.colors, ...uikitTheme } };
  }

  if (name === ThemeName.Light) {
    return { ...LightTheme, colors: { ...LightTheme.colors, ...uikitTheme } };
  }

  return { ...BlueTheme, colors: { ...BlueTheme.colors, ...uikitTheme } };
};

const TonThemeProvider = ({ children }) => {
  const accent = useSelector(accentSelector);
  const themeName = useThemeName();

  const accentColors =
    accent !== AccentKey.default ? AppearanceAccents[accent].colors : undefined;

  const uiThemeAccentColors = useMemo(() => {
    if (!accentColors) {
      return {};
    }
    return {
      textAccent: accentColors.accentPrimary,
      buttonPrimaryBackground: accentColors.accentPrimary,
      buttonPrimaryBackgroundDisabled: accentColors.accentPrimaryLight,
      buttonPrimaryBackgroundHighlighted: accentColors.accentPrimaryDark,
      fieldActiveBorder: accentColors.accentPrimary,
      accentBlue: accentColors.accentPrimary,
      tabBarActiveIcon: accentColors.accentPrimary,
    };
  }, [accentColors]);

  const uitheme = useMemo(
    () => ({ ...getThemeByName(themeName), ...uiThemeAccentColors }),
    [themeName, uiThemeAccentColors],
  );

  const legacyTheme = useMemo(() => getLegacyThemeByName(themeName), [themeName]);

  const theme = useMemo(
    (): TonTheme => ({
      ...legacyTheme,
      colors: {
        ...legacyTheme.colors,
        ...accentColors,
        ...uiThemeAccentColors,
      },
    }),
    [accentColors, legacyTheme, uiThemeAccentColors],
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.backgroundPrimary }}>
      <ThemeProvider theme={uitheme}>
        <StyledThemeProvider {...{ theme }}>{children}</StyledThemeProvider>
      </ThemeProvider>
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
