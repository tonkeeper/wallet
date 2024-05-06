import React, { FC, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { StatusBar } from 'react-native';

import { setNavigationRef, onNavigationReady } from './imperative';
import { AppStack } from './MainStack';
import { mainSelector } from '$store/main';
import { ProvidersWithoutNavigation } from './Providers';
import { useTheme } from '@tonkeeper/uikit';

export const AppNavigator: FC = () => {
  const theme = useTheme();
  const { isInitiating } = useSelector(mainSelector);

  const navigationTheme = useMemo(
    () => ({
      dark: true,
      colors: {
        primary: theme.accentBlue,
        background: theme.backgroundPage,
        card: theme.backgroundPage,
        text: theme.textPrimary,
        notification: theme.backgroundPage,
        border: 'none',
      },
    }),
    [theme],
  );

  if (isInitiating) {
    return null;
  }

  return (
    <NavigationContainer
      ref={setNavigationRef}
      onReady={onNavigationReady}
      theme={navigationTheme}
    >
      <ProvidersWithoutNavigation>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor={'transparent'}
          translucent
        />
        <AppStack />
      </ProvidersWithoutNavigation>
    </NavigationContainer>
  );
};
