import React, { FC, useEffect, useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainStackParamList } from './MainStack.interface';
import { AppStackRouteNames, MainStackRouteNames } from '$navigation';
import { TabStack } from './TabStack/TabStack';

import { useTheme } from '$hooks/useTheme';
import { DevStack } from '../DevStack/DevStack';
import { useAttachScreen } from '../AttachScreen';
import { SetupNotifications } from '$core/SetupNotifications/SetupNotifications';
import { Jetton } from '$core/Jetton/Jetton';
import { DeleteAccountDone } from '$core/DeleteAccountDone/DeleteAccountDone';
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
import { AccessConfirmation, AddWatchOnly, AddressUpdateInfo, Intro } from '$core';
import { ModalStack } from '$navigation/ModalStack';
import { withModalStack } from '@tonkeeper/router';
import { ToncoinScreen } from '$core/Wallet/ToncoinScreen';
import { TronTokenScreen } from '../../tabs/Wallet/TronTokenScreen';
import { reloadSubscriptionsFromServer } from '$store/subscriptions/sagas';
import { InscriptionScreen } from '$core/InscriptionScreen';
import { useDiamondsChecker } from '$hooks/useDiamondsChecker';
import { useWallet } from '@tonkeeper/shared/hooks';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack: FC = () => {
  const attachedScreen = useAttachScreen();
  const theme = useTheme();

  const { isIntroShown, isUnlocked } = useSelector(mainSelector);
  const wallet = useWallet();
  useNotificationsResolver();
  useDiamondsChecker();

  useEffect(() => {
    if (wallet) {
      reloadSubscriptionsFromServer(wallet.address.ton.friendly);
    }
  }, [wallet]);

  const initialRouteName = !attachedScreen.pathname
    ? MainStackRouteNames.Tabs
    : MainStackRouteNames.DevStack;

  const hasWallet = !!wallet;

  const showLockScreen = !isUnlocked && hasWallet && !attachedScreen.pathname;

  const root = useMemo(() => {
    if (!hasWallet && isIntroShown) {
      return (
        <Stack.Screen
          name={AppStackRouteNames.Intro}
          component={Intro}
          options={{
            contentStyle: { backgroundColor: theme.colors.backgroundPrimary },
          }}
        />
      );
    } else if (showLockScreen) {
      return (
        <Stack.Screen
          name={AppStackRouteNames.MainAccessConfirmation}
          component={AccessConfirmation}
        />
      );
    } else {
      return <Stack.Screen name={MainStackRouteNames.Tabs} component={TabStack} />;
    }
  }, [hasWallet, isIntroShown, showLockScreen, theme.colors.backgroundPrimary]);

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
      {root}
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
      <Stack.Screen name={MainStackRouteNames.AddWatchOnly} component={AddWatchOnly} />
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
      <Stack.Screen name={MainStackRouteNames.Jetton} component={Jetton} />
      <Stack.Screen
        name={MainStackRouteNames.Inscription}
        component={InscriptionScreen}
      />
      <Stack.Screen name={MainStackRouteNames.ManageTokens} component={ManageTokens} />
      <Stack.Screen
        name={MainStackRouteNames.AddressUpdateInfo}
        component={AddressUpdateInfo}
      />
    </Stack.Navigator>
  );
};

export const AppStack = withModalStack({
  RootStack: MainStack,
  ModalStack: ModalStack,
});
