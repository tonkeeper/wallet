import { Icon, List, Spacer, View } from '$uikit';
import React, { useCallback, useRef } from 'react';
import { Steezy } from '$styles';
import { INotification } from '$store/zustand/notifications/types';
import { disableNotifications, useConnectedAppsList } from '$store';
import { format } from '$utils';
import { Swipeable } from 'react-native-gesture-handler';
import { TouchableOpacity } from 'react-native';
import { IconProps } from '$uikit/Icon/Icon';
import { useNotificationsStore } from '$store/zustand/notifications/useNotificationsStore';
import { t } from '$translation';
import { isToday } from 'date-fns';
import { useActionSheet } from '@expo/react-native-action-sheet';
import _ from 'lodash';
import { TonConnect } from '$tonconnect';
import messaging from '@react-native-firebase/messaging';
import { useSelector } from 'react-redux';
import { walletAddressSelector } from '$store/wallet';

interface NotificationProps {
  notification: INotification;
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
      <Icon name={props.icon} />
    </View>
  </TouchableOpacity>
);

export const Notification: React.FC<NotificationProps> = (props) => {
  const app = useConnectedAppsList().find(
    (app) => app.url === props.notification.dapp_url,
  );
  const walletAddress = useSelector(walletAddressSelector);
  const { showActionSheetWithOptions } = useActionSheet();
  const deleteNotification = useNotificationsStore(
    (state) => state.actions.deleteNotificationByReceivedAt,
  );
  const swipeableRef = useRef(null);

  const subtitle =
    (props.notification.name || app?.name || t('notifications.disconnected_app')) +
    ' · ' +
    format(
      props.notification.received_at,
      isToday(props.notification.received_at) ? 'HH:mm' : 'd MMM, HH:mm',
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

  const renderRightActions = useCallback(() => {
    return (
      <View style={styles.rightActionsContainer}>
        {app && (
          <>
            <ActionButton icon="ic-ellipsis-16" onPress={handleOpenSettings} />
            <Spacer x={12} />
          </>
        )}
        <ActionButton
          onPress={() => deleteNotification(props.notification.received_at)}
          icon="ic-trash-bin-16"
        />
      </View>
    );
  }, [deleteNotification, handleOpenSettings, props.notification.received_at]);

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions}>
      <List style={styles.listStyle.static}>
        <List.Item
          imageStyle={styles.imageStyle.static}
          leftContentStyle={styles.leftContentStyle.static}
          picture={props.notification.icon_url || app?.icon}
          titleProps={{
            variant: 'body2',
            numberOfLines: 4,
            style: styles.cellTitle.static,
          }}
          title={props.notification.title}
          subtitle={subtitle}
        />
      </List>
    </Swipeable>
  );
};

const styles = Steezy.create(({ colors }) => ({
  listStyle: {
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
