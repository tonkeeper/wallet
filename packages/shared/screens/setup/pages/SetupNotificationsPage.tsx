import { Steezy, View, Text, Spacer, Button, Icon } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';

interface SetupNotificationsPageProps {
  onEnable: () => void;
  loading: boolean;
}

export const SetupNotificationsPage = memo<SetupNotificationsPageProps>((props) => {
  const { onEnable, loading } = props;

  return (
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
          onPress={onEnable}
          loading={loading}
        />
      </View>
    </View>
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
}));
