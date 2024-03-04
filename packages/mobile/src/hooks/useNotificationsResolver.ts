import React from 'react';
import messaging from '@react-native-firebase/messaging';
import { useNavigation } from '@tonkeeper/router';
import { useSelector } from 'react-redux';
import { mainSelector } from '$store/main';
import { useDeeplinking } from '$libs/deeplinking';
import { openDAppBrowser, resetToWalletTab } from '$navigation';
import { getDomainFromURL } from '$utils';
import { Alert } from 'react-native';
import { t } from '@tonkeeper/shared/i18n';
import { useNotificationsStore } from '$store';
import { tk } from '$wallet';

export const useNotificationsResolver = () => {
  const { isMainStackInited } = useSelector(mainSelector);
  const nav = useNavigation();
  const deeplinking = useDeeplinking();

  async function handleNotification(remoteMessage) {
    try {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage,
      );

      const account = remoteMessage.data?.account;
      const deeplink = remoteMessage.data?.deeplink;
      const link = remoteMessage.data?.link;
      const dapp_url = remoteMessage.data?.dapp_url;

      if (account) {
        const wallet = tk.getWalletByAddress(account);

        if (wallet && tk.wallet.identifier !== wallet.identifier) {
          resetToWalletTab();
          tk.switchWallet(wallet.identifier);
        }

        useNotificationsStore.getState().actions.removeRedDot(tk.wallet.address.ton.raw);
      }

      if (deeplink) {
        deeplinking.resolve(deeplink);
      } else if (link) {
        if (!dapp_url || getDomainFromURL(link) === getDomainFromURL(dapp_url)) {
          openDAppBrowser(link);
        } else {
          Alert.alert(
            t('notifications.alert.title'),
            t('notifications.alert.description'),
            [
              {
                text: t('notifications.alert.open'),
                onPress: () => openDAppBrowser(link),
                style: 'destructive',
              },
              {
                text: t('notifications.alert.cancel'),
                style: 'cancel',
              },
            ],
          );
        }
      } else if (dapp_url) {
        openDAppBrowser(dapp_url);
      } else {
        nav.navigate('Balances');
      }
    } catch (e) {}
  }

  React.useEffect(() => {
    if (!isMainStackInited) {
      return;
    }

    messaging().onNotificationOpenedApp((remoteMessage) =>
      handleNotification(remoteMessage),
    );

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          handleNotification(remoteMessage);
        }
      });
  }, [isMainStackInited]);
};
