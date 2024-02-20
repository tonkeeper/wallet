import { Button, Icon, IconNames, List, Steezy, Switch, View } from '@tonkeeper/uikit';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { useBiometrySettings, useWallet, useWalletStatus } from '@tonkeeper/shared/hooks';
import { MainStackRouteNames } from '$navigation';
import { useNavigation } from '@tonkeeper/router';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { getLastEnteredPasscode } from '$store/wallet/sagas';
import { useNotificationsSwitch } from '$hooks/useNotificationsSwitch';
import { LayoutAnimation } from 'react-native';

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
  const { lastBackupAt, setupDismissed } = useWalletStatus();
  const wallet = useWallet();
  const nav = useNavigation();

  const { biometryEnabled, enableBiometry, disableBiometry } = useBiometrySettings();
  const unlockVault = useUnlockVault();

  const notifications = useNotificationsSwitch();

  const identifier = wallet.identifier;

  const [biometrySwitch, setBiometrySwtich] = useState(biometryEnabled);

  const initialItems = useMemo(() => {
    const list: SetupItemType[] = [];

    if (!biometryEnabled) {
      list.push(SetupItemType.Biometry);
    }

    if (!notifications.isSubscribed) {
      list.push(SetupItemType.Notifications);
    }

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier]);

  useEffect(() => {
    setBiometrySwtich(biometryEnabled);
  }, [biometryEnabled]);

  const toggleBiometry = useCallback(async () => {
    try {
      setBiometrySwtich((s) => !s);
      if (biometryEnabled) {
        await disableBiometry();
      } else {
        await unlockVault();

        const passcode = getLastEnteredPasscode();
        await enableBiometry(passcode);
      }
    } catch {
      setBiometrySwtich((s) => !s);
    }
  }, [biometryEnabled, disableBiometry, enableBiometry, unlockVault]);

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
        onPress: () => notifications.toggleNotifications(!notifications.isSubscribed),
      });
    }

    if (initialItems.includes(SetupItemType.Biometry)) {
      list.push({
        type: SetupItemType.Biometry,
        iconName: 'ic-full-battery-28',
        title: t('finish_setup.use_biometry', { name: 'Face ID' }),
        switch: biometrySwitch,
        onPress: toggleBiometry,
      });
    }

    if (lastBackupAt === null) {
      list.push({
        type: SetupItemType.Backup,
        iconName: 'ic-key-28',
        title: t('finish_setup.backup'),
        switch: null,
        onPress: () => nav.navigate(MainStackRouteNames.Backup),
      });
    }

    return list;
  }, [biometrySwitch, initialItems, lastBackupAt, nav, notifications, toggleBiometry]);

  useEffect(() => {
    if (
      !setupDismissed &&
      biometryEnabled &&
      notifications.isSubscribed &&
      lastBackupAt !== null
    ) {
      setTimeout(() => handleDone(), 300);
    }
  }, [
    biometryEnabled,
    handleDone,
    lastBackupAt,
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
            onPress={item.onPress}
            title={item.title}
            titleNumberOfLines={2}
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
