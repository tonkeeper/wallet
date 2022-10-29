import React, { useCallback, useRef } from 'react';
import { InternalNotification, NavBar, ScrollHandler, SwitchItem } from '$uikit';
import { debugLog, ns } from '$utils';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Animated from 'react-native-reanimated';
import { Linking, View } from 'react-native';
import { CellSection } from '$shared/components';
import { getSubscribeStatus, SUBSCRIBE_STATUS } from '$utils/messaging';
import { useDispatch } from 'react-redux';
import { NotificationsStatus, useNotificationStatus } from '$hooks/useNotificationStatus';
import messaging from '@react-native-firebase/messaging';
import { useNotifications } from '$hooks/useNotifications';
import { toastActions } from '$store/toast';
import { t } from '$translation';
import { useNotificationsBadge } from '$hooks/useNotificationsBadge';

export const Notifications: React.FC = () => {
  const dispatch = useDispatch();
  const handleOpenSettings = useCallback(() => Linking.openSettings(), []);
  const notifications = useNotifications();
  const tabBarHeight = useBottomTabBarHeight();
  const isSwitchFrozen = useRef(false);

  const notificationStatus = useNotificationStatus();
  const notificationsBadge = useNotificationsBadge();
  const shouldEnableNotifications = notificationStatus === NotificationsStatus.DENIED;

  const [isSubscribeNotifications, setIsSubscribeNotifications] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      const subscribeStatus = await getSubscribeStatus();
      const status = await messaging().hasPermission();

      const isGratend =
        status === NotificationsStatus.AUTHORIZED ||
        status === NotificationsStatus.PROVISIONAL;

      const initialValue = isGratend && subscribeStatus === SUBSCRIBE_STATUS.SUBSCRIBED;
      setIsSubscribeNotifications(initialValue);
    };

    init();
  }, []);

  React.useEffect(() => {
    if (notificationsBadge.isVisible) {
      notificationsBadge.hide();
    }
  }, [notificationsBadge.isVisible]);

  const handleToggleNotifications = React.useCallback(async (value: boolean) => {
    if (isSwitchFrozen.current) {
      return;
    }

    try {
      isSwitchFrozen.current = true;
      setIsSubscribeNotifications(value);

      const isSuccess = value
        ? await notifications.subscribe()
        : await notifications.unsubscribe();

      if (!isSuccess) {
        // Revert
        setIsSubscribeNotifications(!value);
      }
    } catch (err) {
      dispatch(
        toastActions.fail({ type: 'small', label: t('notifications_not_supported') }),
      );
      debugLog('[NotificationsSettings]', err);
      setIsSubscribeNotifications(!value); // Revert
    } finally {
      isSwitchFrozen.current = false;
    }
  }, []);

  return (
    <>
      <NavBar>{t('notifications_title')}</NavBar>
      <ScrollHandler>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: ns(16),
            paddingTop: ns(16),
            paddingBottom: tabBarHeight,
          }}
          scrollEventThrottle={16}
        >
          {shouldEnableNotifications && (
            <View style={{ marginBottom: 16 }}>
              <InternalNotification
                title={t('notifications_disabled_title')}
                caption={t('notifications_disabled_description')}
                action={t('notifications_disabled_action')}
                mode={'warning'}
                onPress={handleOpenSettings}
              />
            </View>
          )}
          <CellSection>
            <SwitchItem
              title={t('notifications_switch_title')}
              subtitle={t('notification_switch_description')}
              disabled={shouldEnableNotifications}
              onChange={handleToggleNotifications}
              value={isSubscribeNotifications}
            />
          </CellSection>
        </Animated.ScrollView>
      </ScrollHandler>
    </>
  );
};
