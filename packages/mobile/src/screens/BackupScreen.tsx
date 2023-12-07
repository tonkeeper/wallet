import { Button, Icon, List, Screen, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { useNavigation } from '@tonkeeper/router';
import { useNewWallet } from '@tonkeeper/shared/hooks/useNewWallet';
import { memo } from 'react';
import { format } from 'date-fns';
import { getLocale } from '$utils/date';
import { t } from '@tonkeeper/shared/i18n';

export const BackupScreen = memo(() => {
  const wallet = useNewWallet();
  const nav = useNavigation();

  return (
    <Screen>
      <Screen.Header title={t('backup_screen.title')} />

      <Screen.ScrollView>
        <View style={styles.info}>
          <Text type="h3">{t('backup_screen.manual_title')}</Text>
          <Spacer y={4} />
          <Text type="body2" color="textSecondary">
            {t('backup_screen.manual_caption')}
          </Text>
        </View>

        {wallet.lastBackupTimestamp === null ? (
          <View style={styles.indentHorizontal}>
            <Button
              onPress={() => nav.navigate('/backup-warning')}
              title={t('backup_screen.manual_button')}
              color="secondary"
            />
          </View>
        ) : (
          <>
            <List>
              <List.Item
                chevron
                title={t('backup_screen.manual_backup_on')}
                onPress={() => nav.navigate('/backup-warning', { isBackupAgain: true })}
                subtitle={t('backup_screen.last_backup_time', {
                  time: format(wallet.lastBackupTimestamp, 'MMM dd yyyy, HH:mm', {
                    locale: getLocale(),
                  }),
                })}
                leftContent={
                  <View style={styles.checkmarkIcon}>
                    <Icon name="ic-donemark-28" />
                  </View>
                }
              />
            </List>
            <List>
              <List.Item
                title={t('backup_screen.show_recovery_phrase')}
                rightContent={<Icon name="ic-key-28" color="accentBlue" />}
                onPress={() => nav.navigate('/backup-warning')}
              />
            </List>
          </>
        )}
      </Screen.ScrollView>
    </Screen>
  );
});

const styles = Steezy.create(({ colors }) => ({
  info: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  indentHorizontal: {
    marginHorizontal: 16,
  },
  checkmarkIcon: {
    backgroundColor: colors.accentGreen,
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
