import React, { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '$hooks';
import { BalancesStackRouteNames } from '$navigation';
import { Balances } from '$core';
import { BalancesStackParamList } from '$navigation/BalancesStack/BalancesStack.interface';
import { JettonsList } from '$core/JettonsList/JettonsList';

const Stack = createNativeStackNavigator<BalancesStackParamList>();

export const BalancesStack: FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={BalancesStackRouteNames.Balances}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: theme.colors.backgroundPrimary,
        },
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name={BalancesStackRouteNames.Balances} component={Balances} />
      <Stack.Screen name={BalancesStackRouteNames.JettonsList} component={JettonsList} />
    </Stack.Navigator>
  );
};
