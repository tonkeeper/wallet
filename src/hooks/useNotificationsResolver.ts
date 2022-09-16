import React from 'react';
import messaging from '@react-native-firebase/messaging';
import { useNavigation } from './useNavigation';
import { useSelector } from 'react-redux';
import { mainSelector } from '$store/main';

export const useNotificationsResolver = () => {
  const { isMainStackInited } = useSelector(mainSelector);
  const nav = useNavigation();

  React.useEffect(() => {
    if (!isMainStackInited) {
      return;
    }

    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage,
      );

      nav.navigate('Balances');
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage);

          // openTransaction({
          //   currency: CryptoCurrencies.Ton,
          //   hash: ''
          // });
        }
      });
  }, [isMainStackInited]);
};
