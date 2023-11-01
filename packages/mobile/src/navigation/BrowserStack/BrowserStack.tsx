import React, { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '$hooks/useTheme';
import { BrowserStackRouteNames } from '$navigation';
import { DAppsCategory, DAppsExplore } from '$core';
import { BrowserStackParamList } from './BrowserStack.interface';

const Stack = createNativeStackNavigator<BrowserStackParamList>();

export const BrowserStack: FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={BrowserStackRouteNames.Explore}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: theme.colors.backgroundPrimary,
        },
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name={BrowserStackRouteNames.Explore} component={DAppsExplore} />
      <Stack.Screen name={BrowserStackRouteNames.Category} component={DAppsCategory} />
    </Stack.Navigator>
  );
};
