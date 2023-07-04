import { Icon, List, Spacer, Text, View } from '$uikit';
import React, { useCallback, useRef } from 'react';
import { Steezy } from '$styles';
import { INotification } from '$store/zustand/notifications/types';
import { disableNotifications, useConnectedAppsList } from '$store';
import { format, getDomainFromURL } from '$utils';
import { Swipeable, TouchableOpacity } from 'react-native-gesture-handler';
import { IconProps } from '$uikit/Icon/Icon';
import { useNotificationsStore } from '$store/zustand/notifications/useNotificationsStore';
import { t } from '$translation';
import { isToday } from 'date-fns';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { TonConnect } from '$tonconnect';
import messaging from '@react-native-firebase/messaging';
import { useSelector } from 'react-redux';
import { walletAddressSelector } from '$store/wallet';
import { openDAppBrowser } from '$navigation';
import { Animated } from 'react-native';

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
  const walletAddress = useSelector(walletAddressSelector);
  const { showActionSheetWithOptions } = useActionSheet();
  const deleteNotification = useNotificationsStore(
    (state) => state.actions.deleteNotificationByReceivedAt,
  );
  const listItemRef = useRef(null);

  const handleDelete = useCallback(() => {
    deleteNotification(props.notification.received_at);
    props.onRemove?.();
  }, [deleteNotification, props]);

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
          const firebaseToken = await messaging().getToken();
          disableNotifications(walletAddress.ton, app.url, firebaseToken);
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
  }, [app, showActionSheetWithOptions, walletAddress.ton]);

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

  const handleOpenInWebView = useCallback(() => {
    if (!props.notification.link) {
      return;
    }
    openDAppBrowser(props.notification.link);
  }, [props.notification.link]);

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
    <View style={styles.containerStyle}>
      <Swipeable
        waitFor={listItemRef}
        overshootFriction={6}
        ref={swipeableRef}
        onSwipeableWillOpen={handleCloseOtherSwipeables}
        renderRightActions={renderRightActions}
      >
        <List style={styles.listStyle.static}>
          <List.Item
            disabled={!props.notification.link}
            onPress={handleOpenInWebView}
            imageStyle={styles.imageStyle.static}
            leftContentStyle={styles.leftContentStyle.static}
            picture={props.notification.icon_url || app?.icon}
            titleProps={{
              variant: 'body2',
              numberOfLines: 4,
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
  containerStyle: {
    marginBottom: 8,
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
