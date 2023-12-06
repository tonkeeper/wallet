import { useNotifications } from '$hooks/useNotifications';
import { t } from '@tonkeeper/shared/i18n';
import { memo, useCallback, useState } from 'react';
import { debugLog } from '$utils/debugLog';
import {
  Screen,
  Steezy,
  View,
  Text,
  Spacer,
  Button,
  Icon,
  Toast,
} from '@tonkeeper/uikit';
import { tk } from '@tonkeeper/shared/tonkeeper';
import { useParams } from '$navigation/imperative';
import { useNavigation } from '@tonkeeper/router';

export const SetupNotificationsScreen = memo(() => {
  const params = useParams<{ onNext?: (onDone: () => void) => void }>();
  const [loading, setLoading] = useState(false);
  const notifications = useNotifications();
  const nav = useNavigation();

  const handleEnableNotifications = useCallback(async () => {
    try {
      setLoading(true);
      if (params.onNext) {
        params.onNext(async () => {
          await notifications.subscribe();
          tk.enableNotifications();
          nav.replace('Tabs');
        });
      }
    } catch (err) {
      setLoading(false);
      Toast.fail(err?.massage);
      debugLog('[SetupNotifications]:', err);
    }
  }, [nav, notifications, params]);

  return (
    <Screen>
      <Screen.Header
        rightContent={
          <View style={styles.headerRightButton}>
            <Button
              title={t('later')}
              onPress={() => {
                params.onNext?.(() => {
                  nav.replace('Tabs');
                });
              }}
              size="header"
              color="secondary"
            />
          </View>
        }
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.icon}>
            <Icon name="ic-notification-128" color="accentBlue" />
          </View>
          <Text type="h2" textAlign="center">
            Get instant{'\n'}notifications
          </Text>
          <Spacer y={4} />
          <Text type="body1" textAlign="center" color="textSecondary">
            {t('setup_notifications_caption')}
          </Text>
        </View>
        <View style={styles.button}>
          <Button
            title={t('setup_notifications_enable_button')}
            onPress={handleEnableNotifications}
            loading={loading}
          />
        </View>
      </View>
    </Screen>
  );
});

const styles = Steezy.create(({ safeArea }) => ({
  container: {
    flex: 1,
    paddingBottom: safeArea.bottom,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 36,
  },
  button: {
    paddingHorizontal: 32,
    paddingTop: 16,
    paddingBottom: 32,
  },
  icon: {
    marginBottom: 16,
  },
  headerRightButton: {
    marginRight: 16,
  },
}));
