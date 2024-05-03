import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '$hooks/useTheme';
import { memo } from 'react';
import { CreateWalletStackParamList, CreateWalletStackRouteNames } from './types';
import { CreatePin } from '$core';
import { SetupNotifications } from '$core/SetupNotifications/SetupNotifications';

const Stack = createNativeStackNavigator<CreateWalletStackParamList>();

export const CreateWalletStack = memo(() => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={CreateWalletStackRouteNames.CreatePasscode}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: theme.colors.backgroundPage,
        },
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen
        name={CreateWalletStackRouteNames.CreatePasscode}
        component={CreatePin}
      />
      <Stack.Screen
        name={CreateWalletStackRouteNames.Notifications}
        component={SetupNotifications}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
});
