import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';

import { Button, InlineKeyboard, NavBar, PinCode, Text } from '$uikit';
import * as S from './AccessConfirmation.style';
import { ns } from '$utils';
import { PinCodeRef } from '$uikit/PinCode/PinCode.interface';
import {
  confirmationVaultReset,
  getCurrentConfirmationVaultPromise,
  setLastEnteredPasscode,
} from '$store/wallet/sagas';
import { UnlockedVault } from '$blockchain';
import { AppStackRouteNames } from '$navigation';
import { walletActions, walletGeneratedVaultSelector } from '$store/wallet';
import { mainActions } from '$store/main';
import { Toast, ToastSize } from '$store';
import { goBack, useParams } from '$navigation/imperative';
import { t } from '@tonkeeper/shared/i18n';

import { tk, vault } from '$wallet';
import { CanceledActionError } from '$core/Send/steps/ConfirmStep/ActionErrors';
import { useBiometrySettings, useWallet } from '@tonkeeper/shared/hooks';

export const AccessConfirmation: FC = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const params = useParams<{ onGoBack: () => void; withoutBiometryOnOpen: boolean }>();
  const [value, setValue] = useState('');

  const [isBiometryFailed, setBiometryFailed] = useState(false);

  const { biometryEnabled, enableBiometry } = useBiometrySettings();

  const pinRef = useRef<PinCodeRef>(null);
  const isUnlock = route.name === AppStackRouteNames.MainAccessConfirmation;
  const wallet = useWallet();
  const generatedVault = useSelector(walletGeneratedVaultSelector);

  useEffect(() => {
    return () => {
      const promise = getCurrentConfirmationVaultPromise();
      if (promise) {
        promise.reject(new CanceledActionError());
        confirmationVaultReset();
      }
    };
  }, []);

  const triggerError = useCallback(() => {
    pinRef.current?.triggerError();
    setValue('');
  }, []);

  const handleKeyboard = useCallback(
    (newValue) => {
      const pin = newValue.substr(0, 4);
      setValue(pin);
      if (pin.length === 4) {
        setTimeout(async () => {
          try {
            const promise = getCurrentConfirmationVaultPromise();
            const walletForUnlock =
              isUnlock || wallet.isWatchOnly ? tk.walletForUnlock : wallet;
            const mnemonic = await vault.exportWithPasscode(
              walletForUnlock.identifier,
              pin,
            );
            const unlockedVault = new UnlockedVault(
              {
                ...wallet.config,
                tonPubkey: Uint8Array.from(Buffer.from(walletForUnlock.pubkey, 'hex')),
              },
              mnemonic,
            );
            pinRef.current?.triggerSuccess();

            setTimeout(async () => {
              setLastEnteredPasscode(pin);

              if (isUnlock) {
                if (!walletForUnlock.tonProof.tonProofToken) {
                  await walletForUnlock.tonProof.obtainProof(
                    await unlockedVault.getKeyPair(),
                  );
                }

                dispatch(mainActions.setUnlocked(true));
              } else {
                goBack();
                promise.resolve(unlockedVault);
              }

              if (isBiometryFailed) {
                enableBiometry(pin).catch(null);
              }
            }, 500);
          } catch (e) {
            console.log(e);
            triggerError();
          }
        }, 300);
      }
    },
    [dispatch, enableBiometry, isBiometryFailed, isUnlock, triggerError, wallet],
  );

  const handleBiometry = useCallback(async () => {
    try {
      const promise = getCurrentConfirmationVaultPromise();

      const walletForUnlock = isUnlock ? tk.walletForUnlock : wallet;
      const passcode = await vault.exportPasscodeWithBiometry();
      const mnemonic = await vault.exportWithPasscode(
        walletForUnlock.identifier,
        passcode,
      );
      const unlockedVault = new UnlockedVault(
        {
          ...wallet.config,
          tonPubkey: Uint8Array.from(Buffer.from(walletForUnlock.pubkey, 'hex')),
        },
        mnemonic,
      );

      pinRef.current?.triggerSuccess();

      setTimeout(async () => {
        if (generatedVault) {
          setLastEnteredPasscode(passcode);
        }

        // Lock screen
        if (isUnlock) {
          if (!walletForUnlock.tonProof.tonProofToken) {
            await walletForUnlock.tonProof.obtainProof(await unlockedVault.getKeyPair());
          }

          dispatch(mainActions.setUnlocked(true));
        } else {
          goBack();
          promise.resolve(unlockedVault);
        }
      }, 500);
    } catch (e) {
      if (!e.message.includes('User canceled')) {
        Toast.fail(e.message, { size: ToastSize.Small });
        setBiometryFailed(true);
      }
      triggerError();
    }
  }, [dispatch, generatedVault, isUnlock, triggerError, wallet]);

  useEffect(() => {
    if (params.withoutBiometryOnOpen || !biometryEnabled) {
      return;
    }

    handleBiometry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          dispatch(walletActions.cleanWallet({ cleanAll: isUnlock }));
        },
      },
    ]);
  }, [dispatch, isUnlock]);

  function renderRightButton() {
    if (generatedVault) {
      return null;
    }

    if (isUnlock) {
      return (
        <Button
          size="navbar_small"
          mode="secondary"
          style={{ marginRight: ns(16) }}
          onPress={handleLogout}
        >
          {t('access_confirmation_logout')}
        </Button>
      );
    }

    return null;
  }

  return (
    <S.Wrap>
      <NavBar
        hideBackButton={isUnlock}
        isCancelButton={!isUnlock}
        onGoBack={params.onGoBack}
        rightContent={renderRightButton()}
      />
      <S.Content style={{ paddingBottom: bottomInset }}>
        <S.PinWrap>
          <Text variant="h3">{t('access_confirmation_title')}</Text>
          <S.Pin>
            <PinCode value={value} ref={pinRef} />
          </S.Pin>
        </S.PinWrap>
        <InlineKeyboard
          disabled={value.length === 4}
          onChange={handleKeyboard}
          value={value}
          biometryEnabled={biometryEnabled && !isBiometryFailed && !generatedVault}
          onBiometryPress={handleBiometry}
        />
      </S.Content>
    </S.Wrap>
  );
};
