import { Button, Icon, List, Screen, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { useNavigation } from '@tonkeeper/router';
import { useNewWallet } from '@tonkeeper/shared/hooks/useNewWallet';
import { memo } from 'react';
import { format } from 'date-fns';
import { getLocale } from '$utils/date';

export const BackupScreen = memo(() => {
  const wallet = useNewWallet();
  const nav = useNavigation();

  return (
    <Screen>
      <Screen.Header title="Backup" />

      <Screen.ScrollView>
        <View style={styles.info}>
          <Text type="h3">Manual</Text>
          <Spacer y={4} />
          <Text type="body2" color="textSecondary">
            Back up your wallet manually by writing down the recovery phrase.
          </Text>
        </View>

        {wallet.lastBackupTimestamp === null ? (
          <Button
            onPress={() => nav.navigate('/backup-warning')}
            title="Back Up Manually"
            color="secondary"
          />
        ) : (
          <>
            <List>
              <List.Item
                chevron
                title="Manual Backup On"
                onPress={() => nav.navigate('/backup-warning', { isBackupAgain: true })}
                subtitle={`Last backup ${format(
                  wallet.lastBackupTimestamp,
                  'MMM dd yyyy, HH:mm',
                  {
                    locale: getLocale(),
                  },
                )}`}
                leftContent={
                  <View style={styles.checkmarkIcon}>
                    <Icon name="ic-donemark-28" />
                  </View>
                }
              />
            </List>
            <List>
              <List.Item
                title="Show Recovery Phrase"
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
  checkmarkIcon: {
    backgroundColor: colors.accentGreen,
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
