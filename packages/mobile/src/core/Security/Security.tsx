import { memo, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Clipboard from '@react-native-community/clipboard';
import * as LocalAuthentication from 'expo-local-authentication';
import { Switch } from 'react-native';

import { walletActions, walletSelector } from '$store/wallet';
import { openChangePin, openResetPin } from '$navigation';
import { detectBiometryType, platform, triggerImpactLight } from '$utils';
import { MainDB } from '$database';
import { Toast } from '$store';
import { openRequireWalletModal } from '$core/ModalContainer/RequireWallet/RequireWallet';
import { t } from '@tonkeeper/shared/i18n';

import { Icon, List, Screen, Steezy, Text, View } from '@tonkeeper/uikit';

export const Security = memo(() => {
  const dispatch = useDispatch();
  const { wallet } = useSelector(walletSelector);
  const [isBiometryEnabled, setBiometryEnabled] = useState(false);
  const [biometryAvail, setBiometryAvail] = useState(-1);
  const isTouchId =
    biometryAvail !== LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION;

  useEffect(() => {
    Promise.all([
      MainDB.isBiometryEnabled(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]).then(([isEnabled, types]) => {
      setBiometryEnabled(isEnabled);
      setBiometryAvail(detectBiometryType(types) || -1);
    });
  }, []);

  const handleBackupSettings = useCallback(() => {
    if (!wallet) {
      return openRequireWalletModal();
    }

    // TODO: wrap this into something that support UI for password decryption for EncryptedVault.
    dispatch(walletActions.backupWallet());
  }, [dispatch, wallet]);

  const handleCopyLockupConfig = useCallback(() => {
    try {
      Clipboard.setString(JSON.stringify(wallet!.vault.getLockupConfig()));
      Toast.success(t('copied'));
    } catch (e) {
      Toast.fail(e.message);
    }
  }, [wallet]);

  const handleBiometry = useCallback(
    (triggerHaptic: boolean) => () => {
      const newValue = !isBiometryEnabled;
      setBiometryEnabled(newValue);

      if (triggerHaptic) {
        triggerImpactLight();
      }

      dispatch(
        walletActions.toggleBiometry({
          isEnabled: newValue,
          onFail: () => setBiometryEnabled(!newValue),
        }),
      );
    },
    [dispatch, isBiometryEnabled],
  );

  const handleChangePasscode = useCallback(() => {
    openChangePin();
  }, []);

  const handleResetPasscode = useCallback(() => {
    openResetPin();
  }, []);

  return (
    <Screen>
      <Screen.Header title={t('security_title')} />
      <Screen.ScrollView>
        {
          <>
            <List>
              <List.Item
                style={styles.listItem}
                onPress={handleBiometry(true)}
                title={t('security_use_biometry_switch', {
                  biometryType: isTouchId
                    ? t(`platform.${platform}.fingerprint`)
                    : t(`platform.${platform}.face_recognition`),
                })}
                rightContent={
                  <Switch value={isBiometryEnabled} onChange={handleBiometry(false)} />
                }
              />
            </List>
            <View style={styles.listDescription}>
              <Text type="body2" color="textSecondary">
                {t('security_use_biometry_tip', {
                  biometryType: isTouchId
                    ? t(`platform.${platform}.fingerprint`)
                    : t(`platform.${platform}.face_recognition`),
                })}
              </Text>
            </View>
          </>
        }
        <List>
          <List.Item
            style={styles.listItem}
            rightContent={<Icon name="ic-lock-28" color="accentBlue" />}
            title={t('security_change_passcode')}
            onPress={handleChangePasscode}
          />
          <List.Item
            style={styles.listItem}
            rightContent={<Icon name="ic-arrow-2-circlepath-28" color="accentBlue" />}
            title={t('security_reset_passcode')}
            onPress={handleResetPasscode}
          />
        </List>
      </Screen.ScrollView>
    </Screen>
  );
});

const styles = Steezy.create({
  listDescription: {
    marginTop: -4,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  listItem: {
    height: 56,
  },
});
