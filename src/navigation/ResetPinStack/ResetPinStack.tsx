import React, { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '$hooks';
import { ResetPinStackRouteNames } from '$navigation';
import { ResetPin, SetupBiometry } from '$core';
import { ResetPinStackParamList } from '$navigation/ResetPinStack/ResetPinStack.interface';

const Stack = createNativeStackNavigator<ResetPinStackParamList>();

export const ResetPinStack: FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={ResetPinStackRouteNames.ResetPin}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: theme.colors.backgroundPrimary,
        },
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name={ResetPinStackRouteNames.ResetPin} component={ResetPin} />
      <Stack.Screen
        name={ResetPinStackRouteNames.SetupBiometry}
        component={SetupBiometry}
      />
    </Stack.Navigator>
  );
};
