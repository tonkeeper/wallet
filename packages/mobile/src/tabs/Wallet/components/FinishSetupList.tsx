import { NotificationsStatus, useNotificationStatus } from '$hooks/useNotificationStatus';
import { Button, Icon, IconNames, List, Steezy, View, isIOS } from '@tonkeeper/uikit';
import { BiometryTypes } from '@tonkeeper/core/src/modules/BiometryModule';
import { useTonkeeper } from '@tonkeeper/shared/hooks/useTonkeeper';
import { useNewWallet } from '@tonkeeper/shared/hooks/useNewWallet';
import { useNotifications } from '$hooks/useNotifications';
import { memo, useCallback, useMemo, useRef } from 'react';
import { tk } from '@tonkeeper/shared/tonkeeper';
import { walletActions } from '$store/wallet';
import { debugLog } from '$utils/debugLog';
import { t } from '@tonkeeper/shared/i18n';
import { useDispatch } from 'react-redux';
import { Switch } from '@tonkeeper/uikit';
import { Linking } from 'react-native';

export const FinishSetupList = memo(() => {
  const tonkeepr = useTonkeeper();
  const wallet = useNewWallet();

  const isFinishedSetup =
    wallet.lastBackupTimestamp !== null &&
    tonkeepr.notificationsEnabled &&
    tonkeepr.biometryEnabled;

  if (wallet.hiddenFinishSetup || isFinishedSetup) {
    return null;
  }

  if (!tonkeepr.newOnboardWasShown) {
    return null;
  }

  return (
    <View style={styles.container}>
      <List.Header
        title={t('finish_setup.header_title')}
        titleTextType="label1"
        marginHorizontal
        {...(wallet.lastBackupTimestamp !== null && {
          rightContent: (
            <Button
              onPress={() => tk.wallet.hideFinishSetup()}
              color="secondary"
              size="header"
              title={t('global_done')}
            />
          ),
        })}
      />
      <List>
        <NotificationsListItem />
        <BiometryListItem />
        {wallet.lastBackupTimestamp === null && (
          <List.Item
            chevron
            navigate="/backup"
            title={t('finish_setup.backup')}
            titleNumberOfLines={2}
            titleTextType="body2"
            leftContent={
              <View style={styles.iconContainer}>
                <Icon name="ic-key-28" />
              </View>
            }
          />
        )}
      </List>
    </View>
  );
});

const BiometryListItem = () => {
  const tonkeeper = useTonkeeper();
  const dispatch = useDispatch();

  const biometryTitle = useMemo(() => {
    if (tk.biometry.type === BiometryTypes.FaceRecognition) {
      return isIOS
        ? t('finish_setup.use_faceid')
        : t('finish_setup.use_face_recognition');
    } else {
      return isIOS ? t('finish_setup.use_touchid') : t('finish_setup.use_fingerprint');
    }
  }, []);

  const biometryIcon = useMemo(() => {
    if (tk.biometry.type === BiometryTypes.FaceRecognition) {
      return isIOS ? 'ic-faceid-28' : 'ic-faceid-android-28';
    } else {
      return isIOS ? 'ic-fingerprint-28' : 'ic-fingerprint-android-28';
    }
  }, []);

  const handleToggle = useCallback(() => {
    if (tk.biometry.isEnrolled) {
      let fail = false;

      dispatch(
        walletActions.toggleBiometry({
          isEnabled: !tonkeeper.biometryEnabled,
          onFail: () => {
            fail = true;
          },
        }),
      );

      if (fail) {
        return;
      }
    } else {
      Linking.openSettings();
    }
  }, [tonkeeper, dispatch]);

  if (tk.biometry.type === BiometryTypes.None) {
    return null;
  }

  return (
    <List.Item
      rightContent={
        <View pointerEvents="none">
          <Switch
            disabled={!tk.biometry.isEnrolled}
            value={tonkeeper.biometryEnabled}
            onChange={handleToggle}
          />
        </View>
      }
      title={biometryTitle}
      onPress={handleToggle}
      titleNumberOfLines={3}
      titleTextType="body2"
      leftContent={
        <View style={styles.iconContainer}>
          <Icon name={biometryIcon as IconNames} />
        </View>
      }
    />
  );
};

const NotificationsListItem = () => {
  const notificationStatus = useNotificationStatus();
  const notifications = useNotifications();
  const isSwitchFrozen = useRef(false);
  const tonkeeper = useTonkeeper();

  const isDisableNotifications = notificationStatus === NotificationsStatus.DENIED;

  const handleToggle = useCallback(
    async (value: boolean) => {
      if (isDisableNotifications) {
        Linking.openSettings();
        return;
      }

      if (isSwitchFrozen.current) {
        return;
      }

      try {
        isSwitchFrozen.current = true;
        if (value) {
          await notifications.subscribe();
        } else {
          await notifications.unsubscribe();
        }
      } catch (err) {
        // Toast.fail(t('notifications_not_supported'), { size: ToastSize.Small });
        Linking.openSettings();
        debugLog('[NotificationsSettings]', err);
      } finally {
        isSwitchFrozen.current = false;
      }
    },
    [notifications, isDisableNotifications],
  );

  if (tonkeeper.notificationsEnabledDuringSetup) {
    return null;
  }

  return (
    <List.Item
      onPress={() => handleToggle(!tonkeeper.notificationsEnabled)}
      title={t('finish_setup.enable_notifications')}
      titleNumberOfLines={2}
      titleTextType="body2"
      leftContent={
        <View style={styles.iconContainer}>
          <Icon name="ic-bell-28" />
        </View>
      }
      rightContent={
        <View pointerEvents="none">
          <Switch
            value={tonkeeper.notificationsEnabled && !isDisableNotifications}
            onChange={() => handleToggle(!tonkeeper.notificationsEnabled)}
            disabled={isDisableNotifications}
          />
        </View>
      }
    />
  );
};

const styles = Steezy.create(({ colors }) => ({
  container: {
    marginBottom: 16,
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
