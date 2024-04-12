import React from 'react';
import {
  InternalNotification,
  Screen,
  Separator,
  Spacer,
  SwitchItem,
  Text,
  View,
} from '$uikit';
import { ns } from '$utils';
import { CellSection } from '$shared/components';
import { t } from '@tonkeeper/shared/i18n';
import { useConnectedAppsList } from '$store';
import { Steezy } from '$styles';
import { SwitchDAppNotifications } from '$core/Notifications/SwitchDAppNotifications';
import { useNotificationsSwitch } from '$hooks/useNotificationsSwitch';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const Notifications: React.FC = () => {
  const connectedApps = useConnectedAppsList();
  const { isSubscribed, isDenied, openSettings, toggleNotifications } =
    useNotificationsSwitch();
  const insets = useSafeAreaInsets();

  return (
    <Screen>
      <Screen.Header title={t('notifications_title')} />
      <Screen.ScrollView
        contentContainerStyle={{
          paddingHorizontal: ns(16),
          paddingBottom: insets.bottom,
        }}
      >
        {isDenied && (
          <View style={{ marginBottom: 16 }}>
            <InternalNotification
              title={t('notifications_disabled_title')}
              caption={t('notifications_disabled_description')}
              action={t('notifications_disabled_action')}
              mode={'warning'}
              onPress={openSettings}
            />
          </View>
        )}
        <CellSection sectionStyle={styles.notificationsSection.static}>
          <SwitchItem
            title={t('notifications_switch_title')}
            subtitle={t('notification_switch_description')}
            disabled={isDenied}
            onChange={toggleNotifications}
            value={isSubscribed}
          />
        </CellSection>
        {connectedApps.length ? (
          <>
            <View style={styles.title}>
              <Text variant="h3">{t('notifications.apps')}</Text>
              <Spacer y={4} />
              <Text color="textSecondary" variant="body2">
                {t('notifications.apps_description')}
              </Text>
            </View>
            <CellSection>
              {connectedApps.map((app) => (
                <View key={app.url}>
                  <SwitchDAppNotifications app={app} />
                  <Separator />
                </View>
              ))}
            </CellSection>
          </>
        ) : null}
      </Screen.ScrollView>
    </Screen>
  );
};

const styles = Steezy.create({
  title: {
    paddingVertical: 14,
  },
  notificationsSection: {
    marginBottom: 16,
  },
});
