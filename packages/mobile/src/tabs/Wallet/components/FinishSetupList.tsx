import { NotificationsStatus } from '$hooks/useNotificationStatus';
import { useNotifications } from '$hooks/useNotifications';
import { debugLog } from '$utils/debugLog';
import messaging from '@react-native-firebase/messaging';
import { t } from '@tonkeeper/shared/i18n';
import { Icon, IconNames, List, Steezy, Toast, View, isIOS } from '@tonkeeper/uikit';
import { ToastSize } from '@tonkeeper/uikit/src/components/Toast';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { walletActions } from '$store/wallet';
import { MainDB } from '../../../database/main';
import { Switch } from '@tonkeeper/uikit';
import { tk } from '@tonkeeper/shared/tonkeeper';
import { BiometryTypes } from '@tonkeeper/core/src/modules/BiometryModule';

export const FinishSetupList = memo(() => {
  return (
    <View style={styles.container}>
      <List.Header title="Finish Setup" titleTextType="label1" marginHorizontal />
      <List>
        <NotificationsListItem />
        <BiometryListItem />
        <List.Item
          chevron
          navigate="/backup"
          title="Back up the wallet recovery phrase"
          titleNumberOfLines={2}
          titleTextType="body2"
          leftContent={
            <View style={styles.iconContainer}>
              <Icon name="ic-key-28" />
            </View>
          }
        />
      </List>
    </View>
  );
});

const BiometryListItem = () => {
  const [biometryEnabled, setBiometryEnabled] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const init = async () => {
      const isEnabled = await MainDB.isBiometryEnabled();
      setBiometryEnabled(isEnabled);
    };

    init();
  }, []);

  const biometryTitle = useMemo(() => {
    if (tk.biometry.type === BiometryTypes.FaceRecognition) {
      return isIOS
        ? 'Use Face ID to approve transactions'
        : 'Use Face Recognition to approve transactions';
    } else if (tk.biometry.type === BiometryTypes.Fingerprint) {
      return isIOS
        ? 'Use Touch ID to approve transactions'
        : 'Use Fingerprint to approve transactions';
    }
  }, []);

  const biometryIcon = useMemo(() => {
    if (tk.biometry.type === BiometryTypes.FaceRecognition) {
      return isIOS ? 'ic-faceid-28' : 'ic-faceid-android-28';
    } else if (tk.biometry.type === BiometryTypes.Fingerprint) {
      return isIOS ? 'ic-fingerprint-28' : 'ic-fingerprint-android-28';
    }
  }, []);

  const handleToggle = useCallback(() => {
    setBiometryEnabled(!biometryEnabled);
    dispatch(
      walletActions.toggleBiometry({
        isEnabled: !biometryEnabled,
        onFail: () => setBiometryEnabled(biometryEnabled),
      }),
    );
  }, [biometryEnabled, dispatch]);

  if (
    tk.biometry.type === BiometryTypes.Unknown ||
    tk.biometry.type === BiometryTypes.None
  ) {
    return null;
  }

  return (
    <List.Item
      rightContent={<Switch value={biometryEnabled} onChange={handleToggle} />}
      title={biometryTitle}
      onPress={handleToggle}
      titleNumberOfLines={2}
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const notifications = useNotifications();
  const isSwitchFrozen = useRef(false);

  useEffect(() => {
    const init = async () => {
      const status = await messaging().hasPermission();

      const isGratend =
        status === NotificationsStatus.AUTHORIZED ||
        status === NotificationsStatus.PROVISIONAL;

      setNotificationsEnabled(isGratend);
    };

    init();
  }, []);

  const handleToggle = useCallback(
    async (value: boolean) => {
      if (isSwitchFrozen.current) {
        return;
      }

      try {
        isSwitchFrozen.current = true;
        setNotificationsEnabled(value);

        const isSuccess = value
          ? await notifications.subscribe()
          : await notifications.unsubscribe();

        if (!isSuccess) {
          // Revert
          setNotificationsEnabled(!value);
        }
      } catch (err) {
        Toast.fail(t('notifications_not_supported'), { size: ToastSize.Small });
        debugLog('[NotificationsSettings]', err);
        setNotificationsEnabled(!value); // Revert
      } finally {
        isSwitchFrozen.current = false;
      }
    },
    [notifications],
  );

  return (
    <List.Item
      title={'Enable transaction notifications'}
      titleNumberOfLines={2}
      titleTextType="body2"
      leftContent={
        <View style={styles.iconContainer}>
          <Icon name="ic-bell-28" />
        </View>
      }
      rightContent={
        <Switch
          value={notificationsEnabled}
          onChange={() => handleToggle(!notificationsEnabled)}
        />
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
