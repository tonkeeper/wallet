import React, { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainStackParamList } from './MainStack.interface';
import { MainStackRouteNames } from '$navigation';
import { TabStack } from './TabStack/TabStack';
import {
  ImportWallet,
  BackupWords,
  Subscriptions,
  Wallet,
  CreatePin,
  SetupWalletDone,
  SetupBiometry,
} from '$core';
import { useTheme } from '$hooks';
import { DevStack } from '../DevStack/DevStack';
import { useAttachScreen } from '../AttachScreen';
import { SetupNotifications } from '$core/SetupNotifications/SetupNotifications';
import { Jetton } from '$core/Jetton/Jetton';
import { JettonsList } from '$core/JettonsList/JettonsList';
import { DeleteAccountDone } from '$core/DeleteAccountDone/DeleteAccountDone';
import { EditConfig } from '$core/EditConfig/EditConfig';
import { useRemoteBridge } from '$tonconnect';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack: FC = () => {
  const attachedScreen = useAttachScreen();
  const theme = useTheme();

  useRemoteBridge();

  const initialRouteName = !attachedScreen.pathname
    ? MainStackRouteNames.Tabs
    : MainStackRouteNames.DevStack;

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: theme.colors.backgroundPrimary,
        },
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name={MainStackRouteNames.Tabs} component={TabStack} />
      <Stack.Screen name={MainStackRouteNames.Wallet} component={Wallet} />
      <Stack.Screen name={MainStackRouteNames.BackupWords} component={BackupWords} />
      <Stack.Screen name={MainStackRouteNames.ImportWallet} component={ImportWallet} />
      <Stack.Screen name={MainStackRouteNames.Subscriptions} component={Subscriptions} />
      <Stack.Screen name={MainStackRouteNames.CreatePin} component={CreatePin} />
      <Stack.Screen name={MainStackRouteNames.SetupBiometry} component={SetupBiometry} />
      <Stack.Screen
        name={MainStackRouteNames.SetupNotifications}
        component={SetupNotifications}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={MainStackRouteNames.ImportWalletDone}
        component={SetupWalletDone}
        options={{
          gestureEnabled: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name={MainStackRouteNames.DeleteAccountDone}
        component={DeleteAccountDone}
        options={{
          gestureEnabled: false,
          animation: 'fade',
        }}
      />
      <Stack.Screen name={MainStackRouteNames.DevStack} component={DevStack} />
      <Stack.Screen name={MainStackRouteNames.EditConfig} component={EditConfig} />
      <Stack.Screen name={MainStackRouteNames.Jetton} component={Jetton} />
      <Stack.Screen name={MainStackRouteNames.JettonsList} component={JettonsList} />
    </Stack.Navigator>
  );
};
