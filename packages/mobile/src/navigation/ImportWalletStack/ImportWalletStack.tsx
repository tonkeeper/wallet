import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '$hooks/useTheme';
import { FC, memo } from 'react';
import { ImportWalletStackParamList, ImportWalletStackRouteNames } from './types';
import { CreatePin, ImportWallet, SetupBiometry } from '$core';
import { SetupNotifications } from '$core/SetupNotifications/SetupNotifications';
import { RouteProp } from '@react-navigation/native';

const Stack = createNativeStackNavigator<ImportWalletStackParamList>();

export const ImportWalletStack = memo(() => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={ImportWalletStackRouteNames.ImportWallet}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: theme.colors.backgroundPrimary,
        },
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen
        name={ImportWalletStackRouteNames.ImportWallet}
        component={ImportWallet}
      />
      <Stack.Screen
        name={ImportWalletStackRouteNames.CreatePasscode}
        component={CreatePin}
      />
      <Stack.Screen
        name={ImportWalletStackRouteNames.Biometry}
        component={
          // TODO fix navigation typing
          SetupBiometry as unknown as FC<{
            route: RouteProp<
              ImportWalletStackParamList,
              ImportWalletStackRouteNames.Biometry
            >;
          }>
        }
      />
      <Stack.Screen
        name={ImportWalletStackRouteNames.Notifications}
        component={SetupNotifications}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
});
