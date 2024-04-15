import { Icon, List, Spacer, Text, View } from '$uikit';
import React, { useCallback, useRef } from 'react';
import { Steezy } from '$styles';
import { INotification, NotificationType } from '$store/zustand/notifications/types';
import {
  disableNotifications,
  useConnectedAppsList,
  useDAppsNotifications,
  useNotificationsStore,
} from '$store';
import { format, getDomainFromURL } from '$utils';
import { Swipeable, TouchableOpacity } from 'react-native-gesture-handler';
import { IconProps } from '$uikit/Icon/Icon';
import { t } from '@tonkeeper/shared/i18n';
import { isToday } from 'date-fns';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { TonConnect } from '$tonconnect';
import { openDAppBrowser } from '$navigation';
import { Alert, Animated } from 'react-native';
import { useWallet } from '@tonkeeper/shared/hooks';
import { useDeeplinking } from '$libs/deeplinking';
import { tk } from '$wallet';

interface NotificationProps {
  notification: INotification;
  onRemove?: () => void;
  closeOtherSwipeable?: React.MutableRefObject<(() => void) | null>;
  lastSwipeableId?: React.MutableRefObject<number | null>;
}

type Options = {
  option: string;
  action?: () => void;
  destructive?: boolean;
  cancel?: boolean;
}[];

export const ActionButton: React.FC<{ icon: IconProps['name']; onPress: () => void }> = (
  props,
) => (
  <TouchableOpacity onPress={props.onPress} activeOpacity={0.7}>
    <View style={styles.actionButton}>
      <Icon color="iconSecondary" name={props.icon} />
    </View>
  </TouchableOpacity>
);

export const Notification: React.FC<NotificationProps> = (props) => {
  const app = useConnectedAppsList().find(
    (app) =>
      props.notification.dapp_url &&
      getDomainFromURL(app.url) === getDomainFromURL(props.notification.dapp_url),
  );
  const wallet = useWallet();
  const { showActionSheetWithOptions } = useActionSheet();
  const { deleteNotificationByReceivedAt } = useDAppsNotifications();
  const listItemRef = useRef(null);
  const toggleRestakeBanner = useNotificationsStore(
    (state) => state.actions.toggleRestakeBanner,
  );

  const handleDelete = useCallback(() => {
    deleteNotificationByReceivedAt(props.notification.received_at);
    props.onRemove?.();
  }, [deleteNotificationByReceivedAt, props]);

  const swipeableRef = useRef(null);

  const subtitle = (
    <Text variant="body2" color={'textSecondary'} numberOfLines={1}>
      {props.notification.name || app?.name || t('notifications.disconnected_app')}
      <Text variant="body2" color="textTertiary">
        {' · '}
      </Text>
      {format(
        props.notification.received_at,
        isToday(props.notification.received_at) ? 'HH:mm' : 'd MMM, HH:mm',
      )}
    </Text>
  );

  const handleOpenSettings = useCallback(async () => {
    const options: Options = [
      app?.notificationsEnabled && {
        option: t('notifications.mute_notifications'),
        action: async () => {
          disableNotifications(wallet.address.ton.friendly, app.url);
        },
      },
      app && {
        option: t('notifications.disconnect_app', { app_name: app?.name }),
        action: () => {
          TonConnect.disconnect(app.url);
        },
        destructive: true,
      },
      { option: t('cancel'), cancel: true },
    ].filter((option) => option) as Options;

    const destructiveButtonIndex = options.findIndex((option) => option.destructive);
    const cancelButtonIndex = options.findIndex((option) => option.cancel);

    // @ts-ignore
    swipeableRef.current?.close?.();

    showActionSheetWithOptions(
      {
        options: options.map((option) => option.option),
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex: number | undefined) => {
        if (selectedIndex !== undefined) {
          options[selectedIndex]?.action?.();
        }
        return;
      },
    );
  }, [app, showActionSheetWithOptions, wallet]);

  const renderRightActions = useCallback(
    (progress) => {
      const opacity = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      });
      return (
        <Animated.View
          onLayout={(e) => e}
          style={[styles.rightActionsContainer.static, { opacity }]}
        >
          {app && (
            <>
              <ActionButton icon="ic-ellipsis-16" onPress={handleOpenSettings} />
              <Spacer x={12} />
            </>
          )}
          <ActionButton onPress={handleDelete} icon="ic-trash-bin-16" />
        </Animated.View>
      );
    },
    [app, handleDelete, handleOpenSettings],
  );
  const deeplinking = useDeeplinking();

  const handleOpenInWebView = useCallback(() => {
    if (props.notification.type === NotificationType.BETTER_STAKE_OPTION_FOUND) {
      toggleRestakeBanner(tk.wallet.address.ton.raw, true);
    }

    if (!props.notification.link && !props.notification.deeplink) {
      return;
    }

    if (props.notification.deeplink) {
      return deeplinking.resolve(props.notification.deeplink);
    }

    if (
      !props.notification.dapp_url ||
      getDomainFromURL(props.notification.link) ===
        getDomainFromURL(props.notification.dapp_url)
    ) {
      openDAppBrowser(props.notification.link);
    } else {
      Alert.alert(t('notifications.alert.title'), t('notifications.alert.description'), [
        {
          text: t('notifications.alert.open'),
          onPress: () => openDAppBrowser(props.notification.link),
          style: 'destructive',
        },
        {
          text: t('notifications.alert.cancel'),
          style: 'cancel',
        },
      ]);
    }
  }, [props.notification.dapp_url, props.notification.link]);

  const handleCloseOtherSwipeables = useCallback(() => {
    if (!props.closeOtherSwipeable || !props.lastSwipeableId) {
      return;
    }
    if (
      props.closeOtherSwipeable.current &&
      props.lastSwipeableId.current !== props.notification.received_at
    ) {
      props.closeOtherSwipeable.current?.();
    }
    props.closeOtherSwipeable.current = () => swipeableRef.current?.close();
    props.lastSwipeableId.current = props.notification.received_at;
  }, [props.closeOtherSwipeable]);

  return (
    <View>
      <Swipeable
        waitFor={listItemRef}
        overshootFriction={6}
        ref={swipeableRef}
        onSwipeableWillOpen={handleCloseOtherSwipeables}
        renderRightActions={renderRightActions}
      >
        <List style={styles.listStyle.static}>
          <List.Item
            disabled={!props.notification.link && !props.notification.deeplink}
            onPress={handleOpenInWebView}
            pictureStyle={styles.imageStyle.static}
            leftContentStyle={styles.leftContentStyle.static}
            picture={props.notification.icon_url || app?.icon}
            titleProps={{
              variant: 'body2',
              numberOfLines: 3,
              style: styles.cellTitle.static,
            }}
            title={props.notification.message}
            subtitle={subtitle}
          />
        </List>
      </Swipeable>
    </View>
  );
};

const styles = Steezy.create(({ colors }) => ({
  listStyle: {
    marginBottom: 0,
  },
  leftContentStyle: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
  },
  cellTitle: {
    marginBottom: 4,
  },
  imageStyle: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  rightActionsContainer: {
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.buttonSecondaryBackground,
  },
}));
