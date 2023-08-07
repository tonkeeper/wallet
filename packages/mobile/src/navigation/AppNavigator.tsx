import React, { FC, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { StatusBar } from 'react-native';

import { setNavigationRef, onNavigationReady } from './imperative';
import { AppStack } from './MainStack';
import { mainSelector } from '$store/main';
import { useTheme } from '$hooks/useTheme';
import { ProvidersWithoutNavigation } from './Providers';

export const AppNavigator: FC = () => {
  const theme = useTheme();
  const { isInitiating } = useSelector(mainSelector);

  const navigationTheme = useMemo(
    () => ({
      dark: true,
      colors: {
        primary: theme.colors.accentPrimary,
        background: theme.colors.backgroundPrimary,
        card: theme.colors.backgroundPrimary,
        text: theme.colors.constantLight,
        notification: theme.colors.backgroundPrimary,
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
          backgroundColor={theme?.colors.constantDark}
        />
        <AppStack />
      </ProvidersWithoutNavigation>
    </NavigationContainer>
  );
};
