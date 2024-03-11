import { useWallet } from '@tonkeeper/shared/hooks';
import { useNotificationsStore } from './useNotificationsStore';
import { useCallback, useMemo } from 'react';
import { shallow } from 'zustand/shallow';

export const useDAppsNotifications = () => {
  const wallet = useWallet();

  const rawAddress = wallet?.address.ton.raw ?? '';
  const shouldHide = !!wallet?.isTestnet || !!wallet.isWatchOnly;

  const data = useNotificationsStore((state) => state.wallets[rawAddress], shallow);

  const updateLastSeen = useCallback(
    () => useNotificationsStore.getState().actions.updateLastSeen(rawAddress),
    [rawAddress],
  );

  const updateLastSeenActivityScreen = useCallback(
    () =>
      useNotificationsStore.getState().actions.updateLastSeenActivityScreen(rawAddress),
    [rawAddress],
  );

  const removeRedDot = useCallback(
    () => useNotificationsStore.getState().actions.removeRedDot(rawAddress),
    [rawAddress],
  );

  const deleteNotificationByReceivedAt = useCallback(
    (receivedAt: number) => {
      return useNotificationsStore
        .getState()
        .actions.deleteNotificationByReceivedAt(receivedAt, rawAddress);
    },
    [rawAddress],
  );

  const removeNotificationsByDappUrl = useCallback(
    (dapp_url: string) => {
      return useNotificationsStore
        .getState()
        .actions.removeNotificationsByDappUrl(dapp_url, rawAddress);
    },
    [rawAddress],
  );

  return useMemo(() => {
    return {
      notifications: data && !shouldHide ? data.notifications ?? [] : [],
      shouldShowRedDot: data && !shouldHide ? !!data.should_show_red_dot : false,
      lastSeenAt: data?.last_seen ?? 0,
      lastSeenActivityScreenAt: data?.last_seen_activity_screen ?? 0,
      updateLastSeen,
      updateLastSeenActivityScreen,
      removeRedDot,
      deleteNotificationByReceivedAt,
      removeNotificationsByDappUrl,
    };
  }, [
    data,
    shouldHide,
    updateLastSeen,
    updateLastSeenActivityScreen,
    removeRedDot,
    deleteNotificationByReceivedAt,
    removeNotificationsByDappUrl,
  ]);
};
