import { NotificationsStatus } from '$hooks/useNotificationStatus';
import { useNotifications } from '$hooks/useNotifications';
import { debugLog } from '$utils/debugLog';
import messaging from '@react-native-firebase/messaging';
import { t } from '@tonkeeper/shared/i18n';
import { Icon, IconNames, List, Steezy, Toast, View, useTheme } from '@tonkeeper/uikit';
import { ToastSize } from '@tonkeeper/uikit/src/components/Toast';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Switch } from 'react-native';

import { detectBiometryType, isAndroid, isIOS } from '$utils';
import { useDispatch } from 'react-redux';
import { walletActions } from '$store/wallet';
import { MainDB } from '../../../database/main';

export const FinishSetupList = memo(() => {
  return (
    <View style={styles.container}>
      <List.Header title="Finish Setup" titleTextType="label1" marginHorizontal />
      <List>
        <NotificationsListItem />
        <BiometryListItem />
        <List.Item
          chevron
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

enum BiometryTypes {
  FaceID = 'FaceID',
  TouchID = 'TouchID',
  Fingerprint = 'Fingerprint',
  FaceRecognition = 'FaceRecognition',
  Unknown = 'Unknown',
}

const BiometryListItem = () => {
  const [biometryEnabled, setBiometryEnabled] = useState(false);
  const [biometryType, setBiometryType] = useState(BiometryTypes.Unknown);
  const dispatch = useDispatch();
  const theme = useTheme();

  useEffect(() => {
    const init = async () => {
      const authTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const biometryType = detectBiometryType(authTypes);

      if (isAndroid) {
        if (biometryType === LocalAuthentication.AuthenticationType.FINGERPRINT) {
          setBiometryType(BiometryTypes.Fingerprint);
        }
        if (biometryType === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
          setBiometryType(BiometryTypes.FaceRecognition);
        }
      } else if (isIOS) {
        if (biometryType === LocalAuthentication.AuthenticationType.FINGERPRINT) {
          setBiometryType(BiometryTypes.TouchID);
        }
        if (biometryType === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
          setBiometryType(BiometryTypes.FaceID);
        }
      }

      const isEnabled = await MainDB.isBiometryEnabled();
      setBiometryEnabled(isEnabled);
    };

    init();
  }, []);

  const titlesByBiometry = useMemo(
    () => ({
      [BiometryTypes.FaceRecognition]: 'Use Face Recognition to approve transactions',
      [BiometryTypes.Fingerprint]: 'Use Fingerprint to approve transactions',
      [BiometryTypes.TouchID]: 'Use Touch ID to approve transactions',
      [BiometryTypes.FaceID]: 'Use Face ID to approve transactions',
    }),
    [],
  );

  const iconsByBiometry = useMemo(
    () => ({
      [BiometryTypes.FaceRecognition]: 'ic-faceid-android-28',
      [BiometryTypes.Fingerprint]: 'ic-fingerprint-android-28',
      [BiometryTypes.TouchID]: 'ic-fingerprint-28',
      [BiometryTypes.FaceID]: 'ic-faceid-28',
    }),
    [],
  );

  const handleToggle = useCallback(() => {
    setBiometryEnabled(!biometryEnabled);
    dispatch(
      walletActions.toggleBiometry({
        isEnabled: !biometryEnabled,
        onFail: () => setBiometryEnabled(biometryEnabled),
      }),
    );
  }, [biometryEnabled, dispatch]);

  if (biometryType === BiometryTypes.Unknown) {
    return null;
  }

  return (
    <List.Item
      title={titlesByBiometry[biometryType]}
      onPress={handleToggle}
      titleNumberOfLines={2}
      titleTextType="body2"
      leftContent={
        <View style={styles.iconContainer}>
          <Icon name={iconsByBiometry[biometryType] as IconNames} />
        </View>
      }
      rightContent={
        <Switch
          trackColor={{ true: theme.accentBlue }}
          value={biometryEnabled}
          onChange={handleToggle}
        />
      }
    />
  );
};

const NotificationsListItem = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const notifications = useNotifications();
  const isSwitchFrozen = useRef(false);
  const theme = useTheme();

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
          trackColor={{ true: theme.accentBlue }}
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
