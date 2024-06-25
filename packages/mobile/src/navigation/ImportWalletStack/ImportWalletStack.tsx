import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '$hooks/useTheme';
import { memo, useEffect } from 'react';
import { ImportWalletStackParamList, ImportWalletStackRouteNames } from './types';
import { CreatePin, ImportWallet } from '$core';
import { SetupNotifications } from '$core/SetupNotifications/SetupNotifications';
import { ChooseLedgerWallets, ChooseWallets, PairSignerScreen } from '../../screens';
import { useDispatch } from 'react-redux';
import { walletActions } from '$store/wallet';

const Stack = createNativeStackNavigator<ImportWalletStackParamList>();

export const ImportWalletStack = memo(() => {
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
        name={ImportWalletStackRouteNames.PairSignerScreen}
        component={PairSignerScreen}
      />
      <Stack.Screen
        name={ImportWalletStackRouteNames.ChooseWallets}
        component={ChooseWallets}
      />
      <Stack.Screen
        name={ImportWalletStackRouteNames.ChooseLedgerWallets}
        component={ChooseLedgerWallets}
      />
      <Stack.Screen
        name={ImportWalletStackRouteNames.CreatePasscode}
        component={CreatePin}
      />
      <Stack.Screen
        name={ImportWalletStackRouteNames.Notifications}
        component={SetupNotifications}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
});
