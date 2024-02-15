import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '$hooks/useTheme';
import { memo, useEffect } from 'react';
import { CreateWalletStackParamList, CreateWalletStackRouteNames } from './types';
import {
  CheckSecretWords,
  CreatePin,
  CreateWallet,
  SecretWords,
  SetupBiometry,
} from '$core';
import { SetupNotifications } from '$core/SetupNotifications/SetupNotifications';
import { useDispatch } from 'react-redux';
import { walletActions } from '$store/wallet';

const Stack = createNativeStackNavigator<CreateWalletStackParamList>();

export const CreateWalletStack = memo(() => {
  const theme = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(walletActions.clearGeneratedVault());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack.Navigator
      initialRouteName={CreateWalletStackRouteNames.CreateWallet}
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
        name={CreateWalletStackRouteNames.CreateWallet}
        component={CreateWallet}
      />
      <Stack.Screen
        name={CreateWalletStackRouteNames.SecretWords}
        component={SecretWords}
      />
      <Stack.Screen
        name={CreateWalletStackRouteNames.CheckSecretWords}
        component={CheckSecretWords}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name={CreateWalletStackRouteNames.CreatePasscode}
        component={CreatePin}
      />
      <Stack.Screen
        name={CreateWalletStackRouteNames.Biometry}
        component={SetupBiometry}
      />
      <Stack.Screen
        name={CreateWalletStackRouteNames.Notifications}
        component={SetupNotifications}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
});
