import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Button, Icon, Spacer, Text, View } from '$uikit';
import { Notification } from '$core/Notifications/Notification';
import { Steezy } from '$styles';
import { openNotifications } from '$navigation';
import { t } from '@tonkeeper/shared/i18n';
import { INotification, useDAppsNotifications } from '$store';
import { FlashList } from '@shopify/flash-list';
import { LayoutAnimation } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Screen } from '@tonkeeper/uikit';

export enum ActivityListItem {
  Notification = 'Notification',
  Title = 'Title',
}

export function getNewNotificationsCount(
  notifications: INotification[],
  lastSeenAt: number,
) {
  return notifications.filter((notification) => notification.received_at > lastSeenAt)
    .length;
}

export function getIndexForEarlierTitle(
  notifications: INotification[],
  lastSeenAt: number,
) {
  return notifications.findIndex((notification) => notification.received_at < lastSeenAt);
}

export const ListEmpty: React.FC = () => {
  const tabbarHeight = useBottomTabBarHeight();
  return (
    <View style={[styles.emptyContainer, { marginBottom: tabbarHeight }]}>
      <View>
        <Text textAlign="center" variant="h2">
          {t('notifications.placeholder.title')}
        </Text>
        <Spacer y={4} />
        <Text textAlign="center" variant="body1" color="textSecondary">
          {t('notifications.placeholder.description')}
        </Text>
      </View>
    </View>
  );
};

export const NotificationsActivity: React.FC = () => {
  const { notifications, lastSeenAt, updateLastSeen } = useDAppsNotifications();
  const list = useRef<FlashList<Element | null> | null>(null);
  const closeOtherSwipeable = useRef<null | (() => void)>(null);
  const lastSwipeableId = useRef<null | number>(null);

  const handleOpenNotificationSettings = useCallback(() => {
    openNotifications();
  }, []);

  const flashListData = useMemo(() => {
    const items: any = notifications
      .sort((a, b) => b.received_at - a.received_at)
      .map((notification) => {
        return {
          type: ActivityListItem.Notification,
          id: notification.received_at,
          item: notification,
        };
      });

    const indexToPushTitle = getIndexForEarlierTitle(notifications, lastSeenAt);

    // divide notifications into two groups: earlier and not seen before
    if (![0, -1].includes(indexToPushTitle)) {
      items.splice(indexToPushTitle, 0, {
        type: ActivityListItem.Title,
        id: 'earlier_title',
        item: t('notifications.earlier'),
      });
    }

    return items;
  }, [lastSeenAt, notifications]);

  useEffect(() => {
    return () => {
      updateLastSeen();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = useCallback(() => {
    list.current?.prepareForLayoutAnimationRender();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [list]);

  const renderNotificationsItem = useCallback(
    (props) => {
      switch (props.item.type) {
        case ActivityListItem.Title:
          return (
            <View style={styles.titleStyle}>
              <Text variant={'h3'}>{props.item.item}</Text>
            </View>
          );
        case ActivityListItem.Notification:
          return (
            <Notification
              lastSwipeableId={lastSwipeableId}
              closeOtherSwipeable={closeOtherSwipeable}
              onRemove={handleRemove}
              notification={props.item.item}
            />
          );
        default:
          return null;
      }
    },
    [handleRemove],
  );

  return (
    <Screen>
      <Screen.Header
        rightContent={
          <Button
            onPress={handleOpenNotificationSettings}
            size="navbar_icon"
            mode="secondary"
            before={<Icon name="ic-sliders-16" color="foregroundPrimary" />}
          />
        }
        title={t('notifications.notifications')}
      />
      {flashListData.length === 0 ? (
        <ListEmpty />
      ) : (
        <Screen.FlashList
          ref={list}
          contentContainerStyle={styles.gap8.static}
          estimatedItemSize={87}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationsItem}
          data={flashListData}
          ListEmptyComponent={ListEmpty}
        />
      )}
    </Screen>
  );
};

const styles = Steezy.create({
  titleStyle: {
    marginVertical: 14,
    marginHorizontal: 16,
  },
  gap8: {
    gap: 8,
  },
  emptyContainer: {
    paddingHorizontal: 32,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
