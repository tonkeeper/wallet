import React, { useMemo } from 'react';
import DeviceInfo from 'react-native-device-info';
import { i18n } from '$translation';
import axios from 'axios';
import {
  getSubscribeStatus,
  removeSubscribeStatus,
  requestUserPermissionAndGetToken,
  saveSubscribeStatus,
  SUBSCRIBE_STATUS,
} from '$utils/messaging';
import { useWallet } from '@tonkeeper/shared/hooks';
import { config } from '$config';

export const useNotifications = () => {
  const wallet = useWallet();

  const subscribe = React.useCallback(async () => {
    console.log('[Notifications]: subscribe');
    if (!wallet) {
      return false;
    }

    const token = await requestUserPermissionAndGetToken();
    if (!token) {
      return false;
    }

    const endpoint = `${config.get(
      'tonapiIOEndpoint',
      wallet.isTestnet,
    )}/v1/internal/pushes/plain/subscribe`;
    const accounts = Object.values(wallet.tonAllAddresses).map((address) => ({
      address: address.raw,
    }));
    const deviceId = DeviceInfo.getUniqueId();

    await axios.post(endpoint, {
      locale: i18n.locale,
      device: deviceId,
      accounts,
      token,
    });

    await saveSubscribeStatus();

    return true;
  }, [wallet]);

  const unsubscribe = React.useCallback(async () => {
    if (!wallet) {
      return false;
    }

    const subscribeStatus = await getSubscribeStatus();
    if (subscribeStatus === SUBSCRIBE_STATUS.UNSUBSCRIBED) {
      return false;
    }

    const deviceId = DeviceInfo.getUniqueId();
    const endpoint = `${config.get('tonapiIOEndpoint', wallet.isTestnet)}/unsubscribe`;

    await axios.post(endpoint, {
      device: deviceId,
    });

    await removeSubscribeStatus();

    return true;
  }, [wallet]);

  return useMemo(() => ({ subscribe, unsubscribe }), [subscribe, unsubscribe]);
};
