import React, { FC, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { useDispatch } from 'react-redux';
import * as SecureStore from 'expo-secure-store';

import { CreatePinProps } from './CreatePin.interface';
import * as S from '../AccessConfirmation/AccessConfirmation.style';
import { NavBar } from '$uikit';
import { detectBiometryType } from '$utils';
import { debugLog } from '$utils/debugLog';
import { openSetupBiometry, openSetupWalletDone } from '$navigation';
import { walletActions } from '$store/wallet';
import { CreatePinForm } from '$shared/components';
import { tk } from '$wallet';
import { popToTop } from '$navigation/imperative';

export const CreatePin: FC<CreatePinProps> = () => {
  const dispatch = useDispatch();

  const doCreateWallet = useCallback(
    (pin: string) => {
      dispatch(
        walletActions.createWallet({
          pin,
          onDone: (identifiers) => {
            openSetupWalletDone(identifiers);
          },
          onFail: () => {},
        }),
      );
    },
    [dispatch],
  );

  const handlePinCreated = useCallback(
    (pin: string) => {
      Promise.all([
        LocalAuthentication.supportedAuthenticationTypesAsync(),
        SecureStore.isAvailableAsync(),
      ])
        .then(([types, isProtected]) => {
          const biometryType = detectBiometryType(types);
          if (biometryType && isProtected) {
            openSetupBiometry(pin, biometryType);
          } else {
            doCreateWallet(pin);
          }
        })
        .catch((err) => {
          console.log('ERR1', err);
          debugLog('supportedAuthenticationTypesAsync', err.message);
          doCreateWallet(pin);
        });
    },
    [doCreateWallet],
  );

  return (
    <S.Wrap>
      <NavBar isForceBackIcon isClosedButton={!!tk.wallet} onClosePress={popToTop} />
      <CreatePinForm onPinCreated={handlePinCreated} />
    </S.Wrap>
  );
};
