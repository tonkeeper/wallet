import { usePrevious, useTranslator } from "$hooks";
import { isServerConfigLoaded } from "$shared/constants";
import { mainActions, mainSelector } from "$store/main";
import { walletActions } from "$store/wallet";
import { InternalNotificationProps } from "$uikit/InternalNotification/InternalNotification.interface";
import { useNetInfo } from "@react-native-community/netinfo";
import { MainDB } from "$database";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Linking } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export const useInternalNotifications = () => {
  const t = useTranslator();
  const dispatch = useDispatch();
  const isConfigError = !isServerConfigLoaded();
  const [isNoSignalDismissed, setNoSignalDismissed] = useState(false);
  const netInfo = useNetInfo();
  const prevNetInfo = usePrevious(netInfo);

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
    badHosts,
    isBadHostsDismissed,
    timeSyncedDismissedTimestamp,
    isTimeSynced,
    t,
    dispatch,
    netInfo,
    isNoSignalDismissed,
    internalNotifications,
    isConfigError,
  ]);

  return notifications;
}