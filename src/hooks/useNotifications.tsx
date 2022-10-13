import React, {useMemo} from 'react';
import DeviceInfo from 'react-native-device-info';
import I18n from 'i18n-js';
import axios from 'axios';
import { getServerConfig } from '$shared/constants';
import { walletWalletSelector } from '$store/wallet';
import { getSubscribeStatus, removeSubscribeStatus, requestUserPermissionAndGetToken, saveSubscribeStatus } from '$utils/messaging';
import { useSelector } from 'react-redux';

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
    const accounts = Object.values(addresses).map((address) => ({ address }))
    const deviceId = DeviceInfo.getUniqueId();

    await axios.post(endpoint, {
      locale: I18n.currentLocale(),
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

    const isSubscribed = await getSubscribeStatus();
    if (!isSubscribed) {
      return false;
    }
    
    const deviceId = DeviceInfo.getUniqueId();  
    const endpoint = `${getServerConfig('tonapiIOEndpoint')}/unsubscribe`;

    await axios.post(endpoint, {
      device: deviceId
    });
    
    await removeSubscribeStatus();

    return true;
  }, []);

  return useMemo(() => ({ subscribe, unsubscribe }), [subscribe, unsubscribe]);
}