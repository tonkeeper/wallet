import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Animated from 'react-native-reanimated';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Clipboard from '@react-native-community/clipboard';
import * as LocalAuthentication from 'expo-local-authentication';
import { Switch } from 'react-native';

import * as S from './Security.style';
import {NavBar, ScrollHandler, Text} from '$uikit';
import { CellSection, CellSectionItem } from '$shared/components';
import { walletActions, walletSelector } from '$store/wallet';
import { useTranslator } from '$hooks';
import { openChangePin, openRequireWalletModal, openResetPin } from '$navigation';
import { toastActions } from '$store/toast';
import { detectBiometryType, ns, platform, triggerImpactLight } from '$utils';
import { MainDB } from '$database';

export const Security: FC = () => {
  const t = useTranslator();
  const dispatch = useDispatch();
  const tabBarHeight = useBottomTabBarHeight();
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
      dispatch(toastActions.success(t('copied')));
    } catch (e) {
      dispatch(toastActions.fail(e.message));
    }
  }, [dispatch, t, wallet]);

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

  function renderBiometryToggler() {
    if (biometryAvail === -1) {
      return null;
    }

    return (
      <>
        <CellSection>
          <CellSectionItem
            onPress={handleBiometry(true)}
            indicator={
              <Switch value={isBiometryEnabled} onChange={handleBiometry(false)} />
            }
          >
            {t('security_use_biometry_switch', {
              biometryType: isTouchId 
                ? t(`platform.${platform}.fingerprint`) 
                : t(`platform.${platform}.face_recognition`),
            })}
          </CellSectionItem>
        </CellSection>
        <S.BiometryTip>
          <Text variant="label2" color="foregroundSecondary">
            {t('security_use_biometry_tip', {
              biometryType: isTouchId
                ? t(`platform.${platform}.fingerprint`)
                : t(`platform.${platform}.face_recognition`),
            })}
          </Text>
        </S.BiometryTip>
      </>
    );
  }

  return (
    <>
      <NavBar>{t('security_title')}</NavBar>
      <ScrollHandler>
        <Animated.ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: ns(16),
            paddingTop: ns(16),
            paddingBottom: tabBarHeight,
          }}
          scrollEventThrottle={16}
        >
          {renderBiometryToggler()}
          <CellSection>
            <CellSectionItem onPress={handleChangePasscode} icon="ic-key-24">
              {t('security_change_passcode')}
            </CellSectionItem>
            <CellSectionItem onPress={handleResetPasscode} icon="ic-reset-24">
              {t('security_reset_passcode')}
            </CellSectionItem>
          </CellSection>
          <CellSection>
            {!!wallet && (
              <CellSectionItem onPress={handleBackupSettings} icon="ic-backup-24">
                {t('settings_backup_seed')}
              </CellSectionItem>
            )}
            {!!wallet && wallet.ton.isLockup() && (
              <CellSectionItem onPress={handleCopyLockupConfig} icon="ic-backup-24">
                Copy lockup config
              </CellSectionItem>
            )}
          </CellSection>
        </Animated.ScrollView>
      </ScrollHandler>
    </>
  );
};
