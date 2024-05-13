import React, { FC, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainStackParamList } from './MainStack.interface';
import { AppStackRouteNames, MainStackRouteNames } from '..';
import { TabStack } from './TabStack/TabStack';

import { useTheme } from '$hooks/useTheme';
import { DevStack } from '../DevStack/DevStack';
import { useAttachScreen } from '../AttachScreen';
import { Jetton } from '$core/Jetton/Jetton';
import { DeleteAccountDone } from '$core/DeleteAccountDone/DeleteAccountDone';
import { ManageTokens } from '$core/ManageTokens/ManageTokens';
import { Staking } from '$core/Staking/Staking';
import { StakingPools } from '$core/StakingPools/StakingPools';
import { StakingPoolDetails } from '$core/StakingPoolDetails/StakingPoolDetails';
import { Subscriptions } from '$core/Subscriptions/Subscriptions';
import { useSelector } from 'react-redux';
import { mainSelector } from '$store/main';
import { useNotificationsResolver } from '$hooks/useNotificationsResolver';
import { AccessConfirmation, AddressUpdateInfo, ChangePin } from '$core';
import { ModalStack } from '../ModalStack';
import { withModalStack } from '@tonkeeper/router';
import { ToncoinScreen } from '$core/Wallet/ToncoinScreen';
import { InscriptionScreen } from '$core/InscriptionScreen';
import { useDiamondsChecker } from '$hooks/useDiamondsChecker';
import { useLockSettings, useWallet } from '@tonkeeper/shared/hooks';
import {
  StartScreen,
  HoldersWebView,
  ChangePinBiometry,
  ResetPin,
  BackupPhraseScreen,
  BackupScreen,
  BackupCheckPhraseScreen,
} from '../../screens';
import { CreateWalletStack } from '../CreateWalletStack';
import { ImportWalletStack } from '../ImportWalletStack';
import { AddWatchOnlyStack } from '../AddWatchOnlyStack';
import { useExternalState } from '@tonkeeper/shared/hooks/useExternalState';
import { tk } from '$wallet';
import { MigrationStack } from '../MigrationStack';
import { useTonPriceUpdater } from '$hooks/useTonPriceUpdater';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { SettingsStack } from '../SettingsStack/SettingsStack';
import { NotCoinVouchers } from '$core/NotCoinVouchers/NotCoinVouchers';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack: FC = () => {
  const attachedScreen = useAttachScreen();
  const theme = useTheme();

  const { isUnlocked } = useSelector(mainSelector);
  const wallet = useWallet();
  useNotificationsResolver();
  useDiamondsChecker();
  useTonPriceUpdater();

  const initialRouteName = !attachedScreen.pathname
    ? MainStackRouteNames.Tabs
    : MainStackRouteNames.DevStack;

  const hasWallet = !!wallet;

  const { lockScreenEnabled } = useLockSettings();

  const shouldObtainTonProof =
    hasWallet &&
    !wallet.isWatchOnly &&
    !wallet.isExternal &&
    !wallet.tonProof.tonProofToken;

  const showLockScreen =
    (lockScreenEnabled || shouldObtainTonProof) &&
    !isUnlocked &&
    hasWallet &&
    !attachedScreen.pathname;

  const isMigrated = useExternalState(tk.migrationStore, (state) => state.isMigrated);

  useEffect(() => {
    SystemNavigationBar.setNavigationColor(
      theme.colors.backgroundPageAlternate,
      theme.isDark ? 'light' : 'dark',
      'navigation',
    );
  }, [theme.colors.backgroundPageAlternate, theme.isDark]);

  const renderRoot = () => {
    if (hasWallet) {
      if (showLockScreen) {
        return (
          <Stack.Screen
            name={AppStackRouteNames.MainAccessConfirmation}
            component={AccessConfirmation}
          />
        );
      }

      return <Stack.Screen name={MainStackRouteNames.Tabs} component={TabStack} />;
    }

    if (!isMigrated && tk.migrationData) {
      return (
        <Stack.Screen
          name={MainStackRouteNames.MigrationStack}
          component={MigrationStack}
        />
      );
    }

    return <Stack.Screen name={MainStackRouteNames.Start} component={StartScreen} />;
  };

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
      <Stack.Group key={hasWallet ? 'tabs' : 'start'}>{renderRoot()}</Stack.Group>
      <Stack.Group>
        <Stack.Screen
          name={MainStackRouteNames.CreateWalletStack}
          component={CreateWalletStack}
        />
        <Stack.Screen
          name={MainStackRouteNames.ImportWalletStack}
          component={ImportWalletStack}
        />
        <Stack.Screen
          name={MainStackRouteNames.AddWatchOnlyStack}
          component={AddWatchOnlyStack}
        />
      </Stack.Group>
      <Stack.Group>
        <Stack.Screen name={MainStackRouteNames.Settings} component={SettingsStack} />
        <Stack.Screen name={MainStackRouteNames.Wallet} component={ToncoinScreen} />
        <Stack.Screen name={MainStackRouteNames.Staking} component={Staking} />
        <Stack.Screen name={MainStackRouteNames.StakingPools} component={StakingPools} />
        <Stack.Screen
          name={MainStackRouteNames.StakingPoolDetails}
          component={StakingPoolDetails}
        />
        <Stack.Screen
          name={MainStackRouteNames.Subscriptions}
          component={Subscriptions}
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
        <Stack.Screen name={MainStackRouteNames.Vouchers} component={NotCoinVouchers} />
        <Stack.Screen
          name={MainStackRouteNames.Inscription}
          component={InscriptionScreen}
        />
        <Stack.Screen
          name={MainStackRouteNames.ManageTokens}
          options={{ gestureEnabled: false }}
          component={ManageTokens}
        />
        <Stack.Screen
          name={MainStackRouteNames.AddressUpdateInfo}
          component={AddressUpdateInfo}
        />
        <Stack.Screen
          name={MainStackRouteNames.HoldersWebView}
          component={HoldersWebView}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name={MainStackRouteNames.ChangePin} component={ChangePin} />
        <Stack.Screen name={MainStackRouteNames.ResetPin} component={ResetPin} />
        <Stack.Screen
          name={MainStackRouteNames.ChangePinBiometry}
          component={ChangePinBiometry}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name={MainStackRouteNames.Backup} component={BackupScreen} />
        <Stack.Screen
          name={MainStackRouteNames.BackupPhrase}
          component={BackupPhraseScreen}
        />
        <Stack.Screen
          name={MainStackRouteNames.BackupCheckPhrase}
          component={BackupCheckPhraseScreen}
          options={{ gestureEnabled: false }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export const AppStack = withModalStack({
  RootStack: MainStack,
  ModalStack: ModalStack,
});
