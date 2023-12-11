import { useNotificationsBadge } from '$hooks/useNotificationsBadge';
import { getCurrentRoute } from '$navigation/imperative';
import { SettingsStackRouteNames } from '$navigation/navigationNames';
import React from 'react';
import { useSelector } from 'react-redux';
import { walletWalletSelector } from '$store/wallet';
import { TabBarBadgeIndicator } from '$navigation/MainStack/TabStack/TabBarBadgeIndicator';
import { useNewWallet } from '@tonkeeper/shared/hooks/useNewWallet';
import { useTonkeeper } from '@tonkeeper/shared/hooks/useTonkeeper';

export const NotificationsIndicator: React.FC = () => {
  const newWallet = useNewWallet();
  const notificationsBadge = useNotificationsBadge();
  const route = getCurrentRoute();
  const wallet = useSelector(walletWalletSelector);
  const tonkeeper = useTonkeeper();

  const isVisible =
    (!!wallet &&
      notificationsBadge.isVisible &&
      route.name !== SettingsStackRouteNames.Notifications) ||
    (newWallet.lastBackupTimestamp === null && tonkeeper.newOnboardWasShown);

  return <TabBarBadgeIndicator isVisible={isVisible} />;
};
