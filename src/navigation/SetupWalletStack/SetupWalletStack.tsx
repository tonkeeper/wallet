import React, { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SetupWalletStackRouteNames } from '$navigation';
import { SetupWalletStackParamList } from '$navigation/SetupWalletStack/SetupWalletStack.interface';
import {
  SetupBiometry,
  CheckSecretWords,
  CreatePin,
  CreateWallet,
  SecretWords,
  SetupWalletDone,
} from '$core';
import { useTheme } from '$hooks';
import { isAndroid } from '$utils';
import { SetupNotifications } from '$core/SetupNotifications/SetupNotifications';

const Stack = createNativeStackNavigator<SetupWalletStackParamList>();

export const SetupWalletStack: FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={SetupWalletStackRouteNames.CreateWallet}
      screenOptions={{
        presentation: 'card',
        animation: isAndroid ? 'default' : 'slide_from_right',
        headerShown: false,
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: theme.colors.backgroundPrimary,
        },
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen
        name={SetupWalletStackRouteNames.CreateWallet}
        component={CreateWallet}
      />
      <Stack.Screen
        name={SetupWalletStackRouteNames.SecretWords}
        component={SecretWords}
      />
      <Stack.Screen
        name={SetupWalletStackRouteNames.CheckSecretWords}
        component={CheckSecretWords}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name={SetupWalletStackRouteNames.SetupCreatePin}
        component={CreatePin}
      />
      <Stack.Screen
        name={SetupWalletStackRouteNames.SetupBiometry}
        component={SetupBiometry}
      />
      <Stack.Screen
        name={SetupWalletStackRouteNames.SetupNotifications}
        component={SetupNotifications}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={SetupWalletStackRouteNames.SetupWalletDone}
        component={SetupWalletDone}
        options={{
          gestureEnabled: false,
          animation: 'fade',
        }}
      />
    </Stack.Navigator>
  );
};
