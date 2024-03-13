import { Screen, View, Steezy, Spacer, Button, Icon, Text, ns } from '@tonkeeper/uikit';
import { memo, useCallback } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { Alert } from 'react-native';
import { tk } from '$wallet';
import { getBiometryName } from '$utils';
import { useNavigation } from '@tonkeeper/router';
import { MigrationStackRouteNames } from '$navigation/MigrationStack/types';
import { useMigration } from '$hooks/useMigration';

export const MigrationStartScreen = memo(() => {
  const nav = useNavigation();
  const { getMnemonicWithBiometry } = useMigration();

  const handleLogout = useCallback(() => {
    Alert.alert(t('settings_reset_alert_title'), t('settings_reset_alert_caption'), [
      {
        text: t('cancel'),
        style: 'cancel',
      },
      {
        text: t('settings_reset_alert_button'),
        style: 'destructive',
        onPress: () => {
          tk.setMigrated();
        },
      },
    ]);
  }, []);

  const handlePasscodePress = useCallback(() => {
    nav.navigate(MigrationStackRouteNames.Passcode);
  }, [nav]);

  const handleBiometryPress = useCallback(async () => {
    try {
      const mnemonic = await getMnemonicWithBiometry();

      nav.navigate(MigrationStackRouteNames.CreatePasscode, { mnemonic });
    } catch {}
  }, [getMnemonicWithBiometry, nav]);

  return (
    <Screen>
      <Screen.Header
        hideBackButton
        rightContent={
          <Button
            size="header"
            color="secondary"
            style={{ marginRight: ns(16) }}
            onPress={handleLogout}
            title={t('access_confirmation_logout')}
          />
        }
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name="ic-gear-128" color="accentBlue" />
            <Spacer y={16} />
            <Text type="h2" textAlign="center">
              {t('migration.title')}
            </Text>
            <Spacer y={4} />
            <Text textAlign="center" color="textSecondary">
              {t('migration.subtitle')}
            </Text>
          </View>
        </View>
        <View style={styles.buttons}>
          <Button title={t('migration.with_passcode')} onPress={handlePasscodePress} />
          <Spacer y={16} />
          <Button
            title={t('migration.with_biometry', {
              type: getBiometryName(tk.biometry.type, { instrumental: true }),
            })}
            color="secondary"
            onPress={handleBiometryPress}
          />
        </View>
      </View>
    </Screen>
  );
});

const styles = Steezy.create(({ safeArea }) => ({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    alignItems: 'center',
  },
  buttons: {
    paddingTop: 16,
    paddingHorizontal: 32,
    paddingBottom: 32,
    marginBottom: safeArea.bottom,
  },
}));
