import React from 'react';
import { walletSelector } from '$store/wallet';
import { useSelector } from 'react-redux';
import { useNotifications } from './useNotifications';
import { getPermission } from '$utils/messaging';

export const useNotificationsSubscribe = () => {
  const { wallet } = useSelector(walletSelector);
  const notifications = useNotifications();

  const isSubscribe = React.useRef(false);
  React.useEffect(() => {
    if (wallet && !isSubscribe.current) {
      getPermission().then((hasPermission) => {
        if (hasPermission) {
          notifications.subscribe();
        }
      });
      isSubscribe.current = true;
    }
  }, [wallet]);
};
