import {
  Button,
  Haptics,
  Icon,
  IconNames,
  List,
  Steezy,
  Switch,
  View,
} from '@tonkeeper/uikit';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { useBiometrySettings, useWallet, useWalletSetup } from '@tonkeeper/shared/hooks';
import { useNavigation } from '@tonkeeper/router';
import { useNotificationsSwitch } from '$hooks/useNotificationsSwitch';
import { LayoutAnimation, Linking } from 'react-native';
import { getBiometryIcon, getBiometryName } from '$utils';

enum SetupItemType {
  Backup = 'Backup',
  Notifications = 'Notifications',
  Biometry = 'Biometry',
}

interface SetupItem {
  type: SetupItemType;
  iconName: IconNames;
  title: string;
  switch: boolean | null;
  onPress: () => void;
}

export const FinishSetupList = memo(() => {
  const { lastBackupAt, setupDismissed } = useWalletSetup();
  const wallet = useWallet();
  const nav = useNavigation();

  const biometry = useBiometrySettings();

  const notifications = useNotificationsSwitch();

  const identifier = wallet.identifier;
  const isTestnet = wallet.isTestnet;

  const initialItems = useMemo(() => {
    const list: SetupItemType[] = [];

    if (biometry.isAvailable && !biometry.isEnabled) {
      list.push(SetupItemType.Biometry);
    }

    if (!isTestnet && notifications.isAvailable && !notifications.isSubscribed) {
      list.push(SetupItemType.Notifications);
    }

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biometry.isAvailable, identifier, isTestnet]);

  const handleDone = useCallback(() => {
    wallet.dismissSetup();

    LayoutAnimation.configureNext({
      ...LayoutAnimation.Presets.easeInEaseOut,
      duration: 200,
    });
  }, [wallet]);

  const items = useMemo(() => {
    const list: SetupItem[] = [];

    if (initialItems.includes(SetupItemType.Notifications)) {
      list.push({
        type: SetupItemType.Notifications,
        iconName: 'ic-bell-28',
        title: t('finish_setup.enable_notifications'),
        switch: notifications.isSubscribed,
        onPress: () => {
          if (notifications.isDenied) {
            Linking.openSettings();
          } else {
            notifications.toggleNotifications(!notifications.isSubscribed);
          }
        },
      });
    }

    if (initialItems.includes(SetupItemType.Biometry)) {
      list.push({
        type: SetupItemType.Biometry,
        iconName: getBiometryIcon(biometry.type),
        title: t('finish_setup.use_biometry', {
          name: getBiometryName(biometry.type, { accusative: true }),
        }),
        switch: biometry.isEnabledSwitch,
        onPress: biometry.toggleBiometry,
      });
    }

    if (lastBackupAt === null) {
      list.push({
        type: SetupItemType.Backup,
        iconName: 'ic-key-28',
        title: t('finish_setup.backup'),
        switch: null,
        onPress: () => nav.navigate('/backup-warning'),
      });
    }

    return list;
  }, [biometry, initialItems, lastBackupAt, nav, notifications]);

  useEffect(() => {
    const notificationsEnabled = !notifications.isAvailable || notifications.isSubscribed;
    const biometryEnabled = !biometry.isAvailable || biometry.isEnabled;
    if (
      !setupDismissed &&
      biometryEnabled &&
      notificationsEnabled &&
      lastBackupAt !== null
    ) {
      setTimeout(() => handleDone(), 300);
    }
  }, [
    biometry.isEnabled,
    biometry.isAvailable,
    handleDone,
    lastBackupAt,
    notifications.isAvailable,
    notifications.isSubscribed,
    setupDismissed,
  ]);

  const headerRightContent = lastBackupAt ? (
    <Button
      onPress={handleDone}
      color="secondary"
      size="header"
      title={t('finish_setup.done_button')}
    />
  ) : null;

  if (items.length === 0 || setupDismissed) {
    return null;
  }

  return (
    <>
      <List.Header
        title={t('finish_setup.header_title')}
        titleTextType="label1"
        indent={true}
        indentTop={true}
        rightContent={headerRightContent}
      />
      <List style={styles.list}>
        {items.map((item) => (
          <List.Item
            key={item.type}
            chevron={item.switch === null}
            onPress={() => {
              if (item.switch !== null) {
                Haptics.impactLight();
              }
              item.onPress();
            }}
            title={item.title}
            titleNumberOfLines={3}
            titleTextType="body2"
            leftContent={
              <View style={styles.iconContainer}>
                <Icon name={item.iconName} />
              </View>
            }
            rightContent={
              item.switch !== null ? (
                <Switch value={item.switch} onChange={item.onPress} />
              ) : null
            }
          />
        ))}
      </List>
    </>
  );
});

const styles = Steezy.create(({ colors }) => ({
  list: {
    marginBottom: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    backgroundColor: colors.backgroundContentTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
