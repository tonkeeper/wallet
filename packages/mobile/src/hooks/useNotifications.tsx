import { NotificationsManager } from '$wallet/managers/NotificationsManager';
import { State } from '@tonkeeper/core';
import { useWallet } from '@tonkeeper/shared/hooks';
import { useExternalState } from '@tonkeeper/shared/hooks/useExternalState';
import { useMemo, useRef } from 'react';

export const useNotifications = () => {
  const wallet = useWallet();

  const initialState = useRef(new State(NotificationsManager.INITIAL_STATE)).current;

  const { isSubscribed } = useExternalState(wallet?.notifications.state ?? initialState);

  return useMemo(
    () => ({
      isSubscribed,
      subscribe: () => {
        return wallet?.notifications.subscribe();
      },
      unsubscribe: () => {
        return wallet?.notifications.unsubscribe();
      },
    }),
    [isSubscribed, wallet],
  );
};
