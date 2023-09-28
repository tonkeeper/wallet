import { usePrevious } from '$hooks/usePrevious';
import { isServerConfigLoaded } from '$shared/constants';
import { mainActions, mainSelector } from '$store/main';
import { walletActions, walletWalletSelector } from '$store/wallet';
import { InternalNotificationProps } from '$uikit/InternalNotification/InternalNotification.interface';
import { useNetInfo } from '@react-native-community/netinfo';
import { MainDB } from '$database';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { t } from '@tonkeeper/shared/i18n';
import { useAddressUpdateStore } from '$store';
import { useFlag } from '$utils/flags';
import { useNavigation } from '@tonkeeper/router';
import { MainStackRouteNames } from '$navigation';

export const useInternalNotifications = () => {
  const dispatch = useDispatch();
  const isConfigError = !isServerConfigLoaded();
  const [isNoSignalDismissed, setNoSignalDismissed] = useState(false);
  const netInfo = useNetInfo();
  const prevNetInfo = usePrevious(netInfo);
  const wallet = useSelector(walletWalletSelector);

  const nav = useNavigation();

  const handleRefresh = useCallback(() => {
    dispatch(walletActions.refreshBalancesPage(true));
  }, [dispatch]);

  useEffect(() => {
    if (netInfo.isConnected && prevNetInfo.isConnected === false) {
      dispatch(mainActions.dismissBadHosts());
      handleRefresh();
    }
  }, [netInfo.isConnected, prevNetInfo.isConnected, handleRefresh, dispatch]);

  const {
    badHosts,
    isBadHostsDismissed,
    internalNotifications,
    timeSyncedDismissedTimestamp,
    isTimeSynced,
  } = useSelector(mainSelector);

  const addressUpdateDismissed = useAddressUpdateStore((s) => s.dismissed);
  const shouldShowAddressUpdate = useFlag('address_style_notice');
  const isUQAddress = useFlag('address_style_nobounce');

  const notifications = useMemo(() => {
    const result: InternalNotificationProps[] = [];

    if (isConfigError) {
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
    } else if (
      !isTimeSynced &&
      (!timeSyncedDismissedTimestamp ||
        timeSyncedDismissedTimestamp < Date.now() - 7 * 24 * 60 * 60 * 1000)
    ) {
      result.push({
        title: t('notify_incorrect_time_err_title'),
        caption: t('notify_incorrect_time_err_caption'),
        mode: 'tertiary',
        onClose: () => {
          MainDB.setTimeSyncedDismissed(Date.now());
          dispatch(mainActions.setTimeSyncedDismissed(Date.now()));
        },
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
    isConfigError,
    netInfo.isConnected,
    badHosts,
    isBadHostsDismissed,
    isTimeSynced,
    timeSyncedDismissedTimestamp,
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
