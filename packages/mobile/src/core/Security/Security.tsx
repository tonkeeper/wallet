import React, { FC, useCallback } from 'react';
import Animated from 'react-native-reanimated';
import Clipboard from '@react-native-community/clipboard';

import * as S from './Security.style';
import { NavBar, ScrollHandler, Text } from '$uikit';
import { CellSection, CellSectionItem } from '$shared/components';
import { MainStackRouteNames, openChangePin } from '$navigation';
import { getBiometryName, ns } from '$utils';
import { Toast } from '$store';
import { t } from '@tonkeeper/shared/i18n';
import { useBiometrySettings, useLockSettings, useWallet } from '@tonkeeper/shared/hooks';
import { useNavigation } from '@tonkeeper/router';
import { vault } from '$wallet';
import { Haptics, Switch } from '@tonkeeper/uikit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const Security: FC = () => {
  const insets = useSafeAreaInsets();
  const wallet = useWallet();
  const nav = useNavigation();

  const biometry = useBiometrySettings();

  const { lockScreenEnabled, toggleLock } = useLockSettings();

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
      if (triggerHaptic) {
        Haptics.impactLight();
      }

      biometry.toggleBiometry();
    },
    [biometry],
  );

  const handleChangePasscode = useCallback(() => {
    openChangePin();
  }, []);

  const handleResetPasscode = useCallback(async () => {
    if (!biometry.isEnabled) {
      return;
    }

    try {
      const passcode = await vault.exportPasscodeWithBiometry();
      nav.navigate(MainStackRouteNames.ResetPin, { passcode });
    } catch {}
  }, [biometry.isEnabled, nav]);

  function renderBiometryToggler() {
    if (!biometry.isAvailable) {
      return null;
    }

    return (
      <>
        <CellSection>
          <CellSectionItem
            onPress={handleBiometry(true)}
            indicator={
              <Switch value={biometry.isEnabledSwitch} onChange={handleBiometry(false)} />
            }
          >
            {t('security_use_biometry_switch', {
              biometryType: getBiometryName(biometry.type, { accusative: true }),
            })}
          </CellSectionItem>
        </CellSection>
        <S.BiometryTip>
          <Text variant="body2" color="foregroundSecondary">
            {t('security_use_biometry_tip')}
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
            paddingBottom: insets.bottom + 16,
          }}
          scrollEventThrottle={16}
        >
          {renderBiometryToggler()}
          <CellSection>
            <CellSectionItem
              onPress={toggleLock}
              indicator={<Switch value={lockScreenEnabled} onChange={toggleLock} />}
            >
              {t('security_lock_screen_switch')}
            </CellSectionItem>
          </CellSection>
          <S.BiometryTip>
            <Text variant="body2" color="foregroundSecondary">
              {t('security_lock_screen_tip')}
            </Text>
          </S.BiometryTip>
          <CellSection>
            <CellSectionItem onPress={handleChangePasscode} icon="ic-lock-28">
              {t('security_change_passcode')}
            </CellSectionItem>
            {biometry.isEnabled ? (
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
