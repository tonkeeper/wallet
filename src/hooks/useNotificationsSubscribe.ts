import React from 'react';
import { walletSelector } from '$store/wallet';
import { useSelector } from 'react-redux';
import { useNotifications } from './useNotifications';
import { getPermission, getSubscribeStatus, SUBSCRIBE_STATUS } from '$utils/messaging';

export const useNotificationsSubscribe = () => {
  const { wallet } = useSelector(walletSelector);
  const notifications = useNotifications();

  const isSubscribe = React.useRef(false);
  React.useEffect(() => {
    async function tryToSubscribe() {
      const subscribeStatus = await getSubscribeStatus();
      console.log('SUBSCRIBE_STATUS', subscribeStatus);
      if (
        (wallet && !isSubscribe.current) &&
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
