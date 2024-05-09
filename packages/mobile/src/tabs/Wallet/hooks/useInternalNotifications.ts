import { usePrevious } from '$hooks/usePrevious';
import { mainActions, mainSelector } from '$store/main';
import { InternalNotificationProps } from '$uikit/InternalNotification/InternalNotification.interface';
import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { t } from '@tonkeeper/shared/i18n';
import { useAddressUpdateStore } from '$store';
import { useFlag } from '$utils/flags';
import { useNavigation } from '@tonkeeper/router';
import { MainStackRouteNames } from '$navigation';
import { config } from '$config';
import { useWallet } from '@tonkeeper/shared/hooks';
import { tk } from '$wallet';

export const useInternalNotifications = () => {
  const dispatch = useDispatch();
  const [isNoSignalDismissed, setNoSignalDismissed] = useState(false);
  const netInfo = useNetInfo();
  const prevNetInfo = usePrevious(netInfo);
  const wallet = useWallet();

  const nav = useNavigation();

  useEffect(() => {
    if (netInfo.isConnected && prevNetInfo.isConnected === false) {
      dispatch(mainActions.dismissBadHosts());
      tk.wallets.forEach((item) => item.reload());
    }
  }, [netInfo.isConnected, prevNetInfo.isConnected, dispatch]);

  const { badHosts, isBadHostsDismissed, internalNotifications } =
    useSelector(mainSelector);

  const addressUpdateDismissed = useAddressUpdateStore((s) => s.dismissed);
  const shouldShowAddressUpdate = useFlag('address_style_notice');
  const isUQAddress = useFlag('address_style_nobounce');

  const notifications = useMemo(() => {
    const result: InternalNotificationProps[] = [];

    if (!config.isLoaded) {
      result.push({
        title: t('notify_no_signal_title'),
        caption: t('notify_no_signal_caption'),
        mode: 'warning',
      });
    } else if (netInfo.isConnected === false) {
      if (!isNoSignalDismissed) {
        result.push({
          title: t('notify_no_signal_title'),
          caption: t('notify_no_signal_caption'),
          mode: 'danger',
          onClose: () => setNoSignalDismissed(true),
        });
      }
    } else if (badHosts.length > 0 && !isBadHostsDismissed) {
      result.push({
        title: t('notify_connection_err_title'),
        caption: t(
          badHosts.length > 1
            ? 'notify_connection_err_caption_few'
            : 'notify_connection_err_caption',
          {
            host: badHosts[0],
            hosts: badHosts.slice(0, badHosts.length - 1).join(', '),
            lastHost: badHosts[badHosts.length - 1],
          },
        ),
        mode: 'danger',
        onClose: () => dispatch(mainActions.dismissBadHosts()),
      });
    }

    if (wallet && !addressUpdateDismissed && shouldShowAddressUpdate) {
      result.push({
        title: `${t('address_update.title')}: EQ » UQ`,
        caption: isUQAddress
          ? t('address_update.notification_desc_did_change')
          : t('address_update.notification_desc_will_change'),
        mode: 'neutral',
        action: t('address_update.learn_more'),
        onPress: () => {
          nav.push(MainStackRouteNames.AddressUpdateInfo);
        },
        onClose: () => useAddressUpdateStore.getState().actions.dismiss(),
      });
    }

    if (internalNotifications.length > 0) {
      for (const item of internalNotifications) {
        const prepared: InternalNotificationProps = {
          title: item.title,
          caption: item.caption,
          mode: item.mode,
          onClose: () => {
            dispatch(mainActions.hideNotification(item));
          },
        };

        if (item.action) {
          prepared.action = item.action.label;
          prepared.onPress = () => {
            if (item.action.type === 'open_link') {
              Linking.openURL(item.action.url!).catch((err) => {
                console.log('cant open url', err);
              });
            }
          };
        }

        result.push(prepared);
      }
    }

    return result;
  }, [
    netInfo.isConnected,
    badHosts,
    isBadHostsDismissed,
    wallet,
    addressUpdateDismissed,
    shouldShowAddressUpdate,
    internalNotifications,
    isNoSignalDismissed,
    dispatch,
    isUQAddress,
    nav,
  ]);

  return notifications;
};
