import { useNotificationsBadge } from '$hooks/useNotificationsBadge';
import { getCurrentRoute } from '$navigation/imperative';
import { SettingsStackRouteNames } from '$navigation/navigationNames';
import React from 'react';
import { useSelector } from 'react-redux';
import { walletWalletSelector } from '$store/wallet';
import { TabBarBadgeIndicator } from '$navigation/MainStack/TabStack/TabBarBadgeIndicator';

export const NotificationsIndicator: React.FC = () => {
  const notificationsBadge = useNotificationsBadge();
  const route = getCurrentRoute();
  const wallet = useSelector(walletWalletSelector);

  const isVisible =
    !!wallet &&
    notificationsBadge.isVisible &&
    route.name !== SettingsStackRouteNames.Notifications;

  return <TabBarBadgeIndicator isVisible={isVisible} />;
};
