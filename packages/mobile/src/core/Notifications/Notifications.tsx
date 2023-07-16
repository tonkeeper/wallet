import React, { useCallback, useRef } from 'react';
import { InternalNotification, Screen, Spacer, SwitchItem, Text, View } from '$uikit';
import { debugLog, ns } from '$utils';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Linking } from 'react-native';
import { CellSection } from '$shared/components';
import { getSubscribeStatus, SUBSCRIBE_STATUS } from '$utils/messaging';
import { useSelector } from 'react-redux';
import { NotificationsStatus, useNotificationStatus } from '$hooks/useNotificationStatus';
import messaging from '@react-native-firebase/messaging';
import { useNotifications } from '$hooks/useNotifications';
import { t } from '$translation';
import { useNotificationsBadge } from '$hooks/useNotificationsBadge';
import { Toast, ToastSize, useConnectedAppsList, useConnectedAppsStore } from '$store';
import { Steezy } from '$styles';
import { getChainName } from '$shared/dynamicConfig';
import { walletAddressSelector } from '$store/wallet';
import FastImage from 'react-native-fast-image';
import { useObtainProofToken } from '$hooks';

export const Notifications: React.FC = () => {
  const address = useSelector(walletAddressSelector);
  const handleOpenSettings = useCallback(() => Linking.openSettings(), []);
  const notifications = useNotifications();
  const tabBarHeight = useBottomTabBarHeight();
  const isSwitchFrozen = useRef(false);
  const obtainProofToken = useObtainProofToken();
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
  }, [notificationsBadge, notificationsBadge.isVisible]);

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
      Toast.fail(t('notifications_not_supported'), { size: ToastSize.Small });
      debugLog('[NotificationsSettings]', err);
      setIsSubscribeNotifications(!value); // Revert
    } finally {
      isSwitchFrozen.current = false;
    }
  }, []);

  const connectedApps = useConnectedAppsList();
  const { enableNotifications, disableNotifications } = useConnectedAppsStore(
    (state) => state.actions,
  );

  const handleSwitchNotifications = React.useCallback(
    async (value: boolean, url: string, session_id: string | undefined) => {
      await obtainProofToken();
      if (value) {
        return enableNotifications(getChainName(), address.ton, url, session_id);
      }
      disableNotifications(getChainName(), address.ton, url);
    },
    [obtainProofToken, disableNotifications, address.ton, enableNotifications],
  );

  return (
    <Screen>
      <Screen.Header title={t('notifications_title')} />
      <Screen.ScrollView
        contentContainerStyle={{
          paddingHorizontal: ns(16),
          paddingBottom: tabBarHeight,
        }}
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
        <CellSection sectionStyle={styles.notificationsSection.static}>
          <SwitchItem
            title={t('notifications_switch_title')}
            subtitle={t('notification_switch_description')}
            disabled={shouldEnableNotifications}
            onChange={handleToggleNotifications}
            value={isSubscribeNotifications}
          />
        </CellSection>
        {/* {connectedApps.length ? (
          <>
            <View style={styles.title}>
              <Text variant="h3">{t('notifications.apps')}</Text>
              <Spacer y={4} />
              <Text variant="body2">{t('notifications.apps_description')}</Text>
            </View>
            <CellSection>
              {connectedApps.map((app) => (
                <SwitchItem
                  icon={
                    <FastImage
                      source={{ uri: app.icon }}
                      style={styles.imageStyle.static}
                    />
                  }
                  key={app.url}
                  title={app.name}
                  value={!!app.notificationsEnabled}
                  onChange={() =>
                    handleSwitchNotifications(
                      !app.notificationsEnabled,
                      app.url,
                      // @ts-ignore
                      app.connections[0]?.clientSessionId,
                    )
                  }
                />
              ))}
            </CellSection>
          </>
        ) : null} */}
      </Screen.ScrollView>
    </Screen>
  );
};

const styles = Steezy.create({
  title: {
    paddingVertical: 14,
  },
  imageStyle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 16,
  },
  notificationsSection: {
    marginBottom: 16,
  },
});
