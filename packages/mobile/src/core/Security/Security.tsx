import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Animated from 'react-native-reanimated';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Clipboard from '@react-native-community/clipboard';
import * as LocalAuthentication from 'expo-local-authentication';
import { Switch } from 'react-native';

import * as S from './Security.style';
import { NavBar, ScrollHandler, Text } from '$uikit';
import { CellSection, CellSectionItem } from '$shared/components';
import { walletActions } from '$store/wallet';
import { MainStackRouteNames, openChangePin } from '$navigation';
import { detectBiometryType, ns, platform, triggerImpactLight } from '$utils';
import { Toast } from '$store';
import { t } from '@tonkeeper/shared/i18n';
import { useBiometrySettings, useWallet } from '@tonkeeper/shared/hooks';
import { useNavigation } from '@tonkeeper/router';
import { vault } from '$wallet';

export const Security: FC = () => {
  const dispatch = useDispatch();
  const tabBarHeight = useBottomTabBarHeight();
  const wallet = useWallet();
  const nav = useNavigation();

  const { biometryEnabled } = useBiometrySettings();

  const [isBiometryEnabled, setBiometryEnabled] = useState(biometryEnabled);
  const [biometryAvail, setBiometryAvail] = useState(-1);
  const isTouchId =
    biometryAvail !== LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION;

  useEffect(() => {
    LocalAuthentication.supportedAuthenticationTypesAsync().then((types) =>
      setBiometryAvail(detectBiometryType(types) || -1),
    );
  }, []);

  const handleCopyLockupConfig = useCallback(() => {
    try {
      Clipboard.setString(JSON.stringify(wallet.getLockupConfig()));
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

  useEffect(() => {
    setBiometryEnabled(biometryEnabled);
  }, [biometryEnabled]);

  const handleChangePasscode = useCallback(() => {
    openChangePin();
  }, []);

  const handleResetPasscode = useCallback(async () => {
    if (!biometryEnabled) {
      return;
    }

    try {
      const passcode = await vault.exportPasscodeWithBiometry();
      nav.navigate(MainStackRouteNames.ResetPin, { passcode });
    } catch {}
  }, [biometryEnabled, nav]);

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
          <Text variant="body2" color="foregroundSecondary">
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
            paddingBottom: tabBarHeight,
          }}
          scrollEventThrottle={16}
        >
          {renderBiometryToggler()}
          <CellSection>
            <CellSectionItem onPress={handleChangePasscode} icon="ic-lock-28">
              {t('security_change_passcode')}
            </CellSectionItem>
            {biometryEnabled ? (
              <CellSectionItem
                onPress={handleResetPasscode}
                icon="ic-arrow-2-circlepath-28"
              >
                {t('security_reset_passcode')}
              </CellSectionItem>
            ) : null}
          </CellSection>
          <CellSection>
            {!!wallet && wallet.isLockup && (
              <CellSectionItem onPress={handleCopyLockupConfig} icon="ic-key-28">
                Copy lockup config
              </CellSectionItem>
            )}
          </CellSection>
        </Animated.ScrollView>
      </ScrollHandler>
    </>
  );
};
