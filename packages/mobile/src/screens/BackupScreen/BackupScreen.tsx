import { Button, Icon, List, Screen, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { useNavigation } from '@tonkeeper/router';
import { memo } from 'react';
import { format } from 'date-fns';
import { getLocale } from '$utils/date';
import { i18n, t } from '@tonkeeper/shared/i18n';
import { useWalletSetup } from '@tonkeeper/shared/hooks';

export const BackupScreen = memo(() => {
  const { lastBackupAt } = useWalletSetup();
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

        {lastBackupAt === null ? (
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
                  time: format(
                    lastBackupAt,
                    i18n.locale === 'ru' ? 'd MMM yyyy, HH:mm' : 'MMM d yyyy, HH:mm',
                    {
                      locale: getLocale(),
                    },
                  ),
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
                rightContent={
                  <View style={styles.keyIcon}>
                    <Icon name="ic-key-28" color="accentBlue" />
                  </View>
                }
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
    paddingTop: 14,
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
  keyIcon: {
    position: 'absolute',
    right: 16,
  },
}));
