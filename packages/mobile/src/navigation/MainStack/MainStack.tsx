import React, { FC, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainStackParamList } from './MainStack.interface';
import { AppStackRouteNames, MainStackRouteNames } from '$navigation';
import { TabStack } from './TabStack/TabStack';

import { useStaking } from '$hooks/useStaking';
import { useTheme } from '$hooks/useTheme';
import { DevStack } from '../DevStack/DevStack';
import { useAttachScreen } from '../AttachScreen';
import { SetupNotifications } from '$core/SetupNotifications/SetupNotifications';
import { Jetton } from '$core/Jetton/Jetton';
import { JettonsList } from '$core/JettonsList/JettonsList';
import { DeleteAccountDone } from '$core/DeleteAccountDone/DeleteAccountDone';
import { EditConfig } from '$core/EditConfig/EditConfig';
import { ManageTokens } from '$core/ManageTokens/ManageTokens';
import { Staking } from '$core/Staking/Staking';
import { StakingPools } from '$core/StakingPools/StakingPools';
import { StakingPoolDetails } from '$core/StakingPoolDetails/StakingPoolDetails';
import { BackupWords } from '$core/BackupWords/BackupWords';
import { ImportWallet } from '$core/ImportWallet/ImportWallet';
import { Subscriptions } from '$core/Subscriptions/Subscriptions';
import { CreatePin } from '$core/CreatePin/CreatePin';
import { SetupBiometry } from '$core/SetupBiometry/SetupBiometry';
import { SetupWalletDone } from '$core/SetupWalletDone/SetupWalletDone';
import { useSelector } from 'react-redux';
import { mainSelector } from '$store/main';
import { walletWalletSelector } from '$store/wallet';
import { useNotificationsResolver } from '$hooks/useNotificationsResolver';
import { AccessConfirmation, Intro } from '$core';
import { ModalStack } from '$navigation/ModalStack';
import { withModalStack } from '@tonkeeper/router';

import { ImportWatchWalletScreen } from '@tonkeeper/shared/screens/setup/ImportWatchWalletScreen';
import { ImportWalletScreen } from '@tonkeeper/shared/screens/setup/ImportWalletScreen';
import { CreateWalletScreen } from '@tonkeeper/shared/screens/setup/CreateWalletScreen';
import { StartScreen } from '@tonkeeper/shared/screens/StartScreen';
import { ToncoinScreen } from '$core/Wallet/ToncoinScreen';
import { TronTokenScreen } from '../../tabs/Wallet/TronTokenScreen';
import { reloadSubscriptionsFromServer } from '$store/subscriptions/sagas';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack: FC = () => {
  const attachedScreen = useAttachScreen();
  const theme = useTheme();

  const { isIntroShown, isUnlocked } = useSelector(mainSelector);
  const wallet = useSelector(walletWalletSelector);
  useNotificationsResolver();

  useEffect(() => {
    if (wallet?.address) {
      reloadSubscriptionsFromServer(wallet.address.friendlyAddress);
    }
  }, [wallet]);

  useStaking();

  const initialRouteName = !attachedScreen.pathname
    ? MainStackRouteNames.Tabs
    : MainStackRouteNames.DevStack;

  function renderRoot() {
    if (isIntroShown) {
      return (
        <Stack.Screen
          name={AppStackRouteNames.Intro}
          component={Intro}
          options={{
            contentStyle: { backgroundColor: theme.colors.backgroundPrimary },
          }}
        />
      );
    } else if (!isUnlocked && wallet && !attachedScreen.pathname) {
      return (
        <Stack.Screen
          name={AppStackRouteNames.MainAccessConfirmation}
          component={AccessConfirmation}
        />
      );
    } else {
      return <Stack.Screen name={MainStackRouteNames.Tabs} component={TabStack} />;
    }
  }

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
      {renderRoot()}
      <Stack.Screen name={MainStackRouteNames.Wallet} component={ToncoinScreen} />
      <Stack.Screen name={'TronTokenScreen'} component={TronTokenScreen} />
      <Stack.Screen name={MainStackRouteNames.Staking} component={Staking} />
      <Stack.Screen name={MainStackRouteNames.StakingPools} component={StakingPools} />
      <Stack.Screen
        name={MainStackRouteNames.StakingPoolDetails}
        component={StakingPoolDetails}
      />
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
      <Stack.Screen name={MainStackRouteNames.ManageTokens} component={ManageTokens} />
    </Stack.Navigator>
  );
};

export const AppStack = withModalStack({
  RootStack: MainStack,
  ModalStack: ModalStack,
});
