import React, { FC, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as StoreProvider, useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components/native';

import { store } from '$store';
import { AppearanceAccents, DarkTheme, TonTheme } from '$styled';
import { AppNavigator } from '$navigation/AppNavigator';
import { Toast, ScrollPositionProvider } from '$uikit';
import { useMemo } from 'react';
import { accentSelector } from '$store/main';
import { ToastComponent } from '$uikit/Toast/new/ToastComponent';
import { View } from 'react-native';

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
  return (
    <StoreProvider {...{ store }}>
      <TonThemeProvider>
        <SafeAreaProvider>
          <ScrollPositionProvider>
            <AppNavigator />
          </ScrollPositionProvider>
          <Toast />
          <ToastComponent />
        </SafeAreaProvider>
      </TonThemeProvider>
    </StoreProvider>
  );
};
