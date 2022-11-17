import React, {useMemo} from 'react';
import DeviceInfo from 'react-native-device-info';
import { i18n } from '$translation';
import axios from 'axios';
import { walletWalletSelector } from '$store/wallet';
import {getServerConfig} from '$shared/constants';
import {
  getSubscribeStatus,
  removeSubscribeStatus,
  requestUserPermissionAndGetToken,
  saveSubscribeStatus,
  SUBSCRIBE_STATUS
} from '$utils/messaging';
import {useSelector} from 'react-redux';

export const useNotifications = () => {  
  const wallet = useSelector(walletWalletSelector);
  
  const subscribe = React.useCallback(async () => {
    console.log('[Notifications]: subscribe')
    if (!wallet) {
      return false;
    }

    const token = await requestUserPermissionAndGetToken();
    if (!token) {
      return false;
    }

    const endpoint = `${getServerConfig('tonapiIOEndpoint')}/subscribe`;
    const addresses = await wallet.ton.getAllAddresses();
    const accounts = Object.values(addresses).map((address) => ({ address }));
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
    const endpoint = `${getServerConfig('tonapiIOEndpoint')}/unsubscribe`;

    await axios.post(endpoint, {
      device: deviceId,
    });

    await removeSubscribeStatus();

    return true;
  }, []);

  return useMemo(() => ({ subscribe, unsubscribe }), [subscribe, unsubscribe]);
}