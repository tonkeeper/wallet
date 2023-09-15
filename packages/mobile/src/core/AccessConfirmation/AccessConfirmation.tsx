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
  getCurrentConfirmationVaultInst,
  getCurrentConfirmationVaultPromise,
  setLastEnteredPasscode,
} from '$store/wallet/sagas';
import { EncryptedVault } from '$blockchain';
import { AppStackRouteNames, openResetPin } from '$navigation';
import { walletActions, walletWalletSelector } from '$store/wallet';
import { mainActions } from '$store/main';
import { MainDB } from '$database';
import { useNotifications } from '$hooks/useNotifications';
import { Toast, ToastSize } from '$store';
import { goBack, useParams } from '$navigation/imperative';
import { t } from '@tonkeeper/shared/i18n';

import { createTronOwnerAddress } from '@tonkeeper/core/src/utils/tronUtils';
import { tk } from '@tonkeeper/shared/tonkeeper';

export const AccessConfirmation: FC = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const notifications = useNotifications();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const params = useParams<{ onGoBack: () => void; withoutBiometryOnOpen: boolean }>();
  const [value, setValue] = useState('');

  const [isBiometryFailed, setBiometryFailed] = useState(false);

  const pinRef = useRef<PinCodeRef>(null);
  const isUnlock = route.name === AppStackRouteNames.MainAccessConfirmation;
  const wallet = useSelector(walletWalletSelector);

  useEffect(() => {
    return () => {
      const promise = getCurrentConfirmationVaultPromise();
      if (promise) {
        promise.reject();
        confirmationVaultReset();
      }
    };
  }, []);

  const triggerError = useCallback(() => {
    pinRef.current?.triggerError();
    setValue('');
  }, []);

  const createTronAddress = useCallback(async (privateKey: Uint8Array) => {
    try {
      // Note: create tron address
      if (!tk.wallet.address.tron) {
        const addresses = await tk.generateTronAddress(privateKey);
        if (addresses) {
          tk.wallet.setTronAddress(addresses);
        }
      } else {
        console.log('skip create tron address');
      }
    } catch (err) {
      console.error('[generate tron address]', err);
    }
  }, []);

  const handleKeyboard = useCallback(
    (newValue) => {
      const pin = newValue.substr(0, 4);
      setValue(pin);
      if (pin.length === 4) {
        const vault = isUnlock ? wallet!.vault : getCurrentConfirmationVaultInst();
        const promise = getCurrentConfirmationVaultPromise();
        // old flow
        if (vault instanceof EncryptedVault) {
          setTimeout(() => {
            vault
              .decrypt(pin)
              .then((unlockedVault) => {
                pinRef.current?.triggerSuccess();

                setTimeout(() => {
                  setLastEnteredPasscode(pin);
                  goBack();
                  promise.resolve(unlockedVault);

                  if (isBiometryFailed) {
                    unlockedVault.saveBiometry();
                  }
                }, 500);
              })
              .catch(() => {
                triggerError();
              });
          }, 300);
        } else {
          // wait animation completion
          setTimeout(() => {
            vault
              .getEncrypted()
              .then((encrypted) => {
                encrypted
                  .decrypt(pin)
                  .then((unlockedVault) => {
                    setLastEnteredPasscode(pin);

                    setTimeout(() => {
                      pinRef.current?.triggerSuccess();

                      setTimeout(async () => {
                        if (isUnlock) {
                          const privateKey = await (
                            unlockedVault as any
                          ).getTonPrivateKey();
                          // createTronAddress(privateKey);
                          
                          dispatch(mainActions.setUnlocked(true));
                        } else {
                          goBack();
                          promise.resolve(unlockedVault);
                        }

                        if (isBiometryFailed) {
                          unlockedVault.saveBiometry();
                        }
                      }, 500);
                    }, 500);
                  })
                  .catch(() => {
                    triggerError();
                  });
              })
              .catch((err) => {
                Toast.fail(err.message);
                triggerError();
              });
          }, 300);
        }
      }
    },
    [dispatch, isBiometryFailed, isUnlock, triggerError, wallet],
  );

  const handleBiometry = useCallback(() => {
    const vault = isUnlock ? wallet!.vault : getCurrentConfirmationVaultInst();
    const promise = getCurrentConfirmationVaultPromise();

    vault
      .unlock()
      .then(async (unlockedVault) => {
        pinRef.current?.triggerSuccess();

        setTimeout(async () => {
          // Lock screen
          if (isUnlock) {
            const privateKey = await (unlockedVault as any).getTonPrivateKey();
            // createTronAddress(privateKey);

            dispatch(mainActions.setUnlocked(true));
          } else {
            goBack();
            promise.resolve(unlockedVault);
          }
        }, 500);
      })
      .catch((e) => {
        Toast.fail(e.message, { size: ToastSize.Small });
        setBiometryFailed(true);
        triggerError();
      });
  }, [dispatch, isUnlock, triggerError, wallet]);

  useEffect(() => {
    if (params.withoutBiometryOnOpen) {
      return;
    }

    MainDB.isBiometryEnabled().then((isEnabled) => {
      if (isEnabled) {
        handleBiometry();
      }
    });
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
          dispatch(walletActions.cleanWallet());
          notifications.unsubscribe();
        },
      },
    ]);
  }, [dispatch, t]);

  const handleReset = useCallback(() => {
    openResetPin();
  }, []);

  function renderRightButton() {
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
    } else {
      return (
        <Button
          size="navbar_small"
          mode="secondary"
          style={{ marginRight: ns(16) }}
          onPress={handleReset}
        >
          {t('access_confirmation_reset')}
        </Button>
      );
    }
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
          biometryEnabled={!isBiometryFailed}
          onBiometryPress={handleBiometry}
        />
      </S.Content>
    </S.Wrap>
  );
};
