import { Button, Icon, List, Spacer, View } from '$uikit';
import React, { useCallback } from 'react';
import { Steezy } from '$styles';
import { INotification } from '$store/zustand/notifications/types';
import { useConnectedAppsList } from '$store';
import { format } from '$utils';
import { Swipeable } from 'react-native-gesture-handler';
import { TouchableOpacity } from 'react-native';
import { IconProps } from '$uikit/Icon/Icon';
import { useNotificationsStore } from '$store/zustand/notifications/useNotificationsStore';

interface NotificationProps {
  notification: INotification;
}

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
    (app) => app.url === props.notification.service_url,
  );
  const deleteNotification = useNotificationsStore(
    (state) => state.actions.deleteNotificationByReceivedAt,
  );

  const subtitle = app?.name + ' · ' + format(props.notification.received_at, 'HH:mm');

  const renderRightActions = useCallback(() => {
    return (
      <View style={styles.rightActionsContainer}>
        <ActionButton icon="ic-ellipsis-16" />
        <Spacer x={12} />
        <ActionButton
          onPress={() => deleteNotification(props.notification.received_at)}
          icon="ic-trash-bin-16"
        />
      </View>
    );
  }, [deleteNotification, props.notification.received_at]);

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <List style={styles.listStyle.static}>
        <List.Item
          imageStyle={styles.imageStyle.static}
          leftContentStyle={styles.leftContentStyle.static}
          picture={app?.icon}
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
