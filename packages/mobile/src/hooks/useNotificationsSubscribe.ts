import React from 'react';
import { useNotifications } from './useNotifications';
import { getPermission, getSubscribeStatus, SUBSCRIBE_STATUS } from '$utils/messaging';
import { useWallet } from '@tonkeeper/shared/hooks';

export const useNotificationsSubscribe = () => {
  const wallet = useWallet();
  const notifications = useNotifications();

  const isSubscribe = React.useRef(false);
  React.useEffect(() => {
    async function tryToSubscribe() {
      const subscribeStatus = await getSubscribeStatus();
      if (
        wallet &&
        !isSubscribe.current &&
        subscribeStatus !== SUBSCRIBE_STATUS.UNSUBSCRIBED
      ) {
        const hasPermission = await getPermission();
        if (hasPermission) {
          notifications.subscribe();
        }
        isSubscribe.current = true;
      }
    }
    tryToSubscribe();
  }, [wallet]);
};
