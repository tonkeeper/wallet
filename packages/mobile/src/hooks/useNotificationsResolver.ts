import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { useNavigation } from './useNavigation';
import { useSelector } from 'react-redux';
import { mainSelector } from '$store/main';
import { useDeeplinking } from '$libs/deeplinking';
import { getToken } from '$utils/messaging';
import { openDAppBrowser } from '$navigation';

export const useNotificationsResolver = () => {
  const { isMainStackInited } = useSelector(mainSelector);
  const nav = useNavigation();
  const deeplinking = useDeeplinking();

  useEffect(() => {
    getToken();
  }, []);

  React.useEffect(() => {
    if (!isMainStackInited) {
      return;
    }

    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage,
      );

      const deeplink = remoteMessage.data?.deeplink;
      const link = remoteMessage.data?.link;
      const dapp_url = remoteMessage.data?.dapp_url;

      if (deeplink) {
        deeplinking.resolve(deeplink);
      } else if (link || dapp_url) {
        openDAppBrowser((link || dapp_url) as string);
      } else {
        nav.navigate('Balances');
      }
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);

          const deeplink = remoteMessage.data?.deeplink;

          if (deeplink) {
            deeplinking.resolve(deeplink);
          }
        }
      });
  }, [isMainStackInited]);
};
