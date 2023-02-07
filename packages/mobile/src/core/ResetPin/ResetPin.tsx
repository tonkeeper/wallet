import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Keyboard } from 'react-native';
import { useDispatch } from 'react-redux';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import { NavBar } from '$uikit';
import * as S from './ResetPin.style';
import { CreatePinForm, ImportWalletForm } from '$shared/components';
import { debugLog, detectBiometryType, deviceWidth } from '$utils';
import { useKeyboardHeight } from '$hooks';
import { walletActions } from '$store/wallet';
import { goBack, openSetupBiometryAfterRestore, popToTop } from '$navigation';
import { toastActions } from '$store/toast';

export const ResetPin: FC = () => {
  const [step, setStep] = useState(0);
  const keyboardHeight = useKeyboardHeight();
  const dispatch = useDispatch();

  const stepsValue = useSharedValue(0);

  useEffect(() => {
    stepsValue.value = withDelay(
      500,
      withTiming(step === 0 ? 0 : 1, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      }),
    );
  }, [step, stepsValue]);

  const handleWordsFilled = useCallback(
    (mnemonics: string, config: any, onEnd: () => void) => {
      dispatch(
        walletActions.restoreWallet({
          mnemonics,
          config,
          onDone: () => {
            Keyboard.dismiss();
            setStep(1);
          },
          onFail: () => onEnd(),
        }),
      );
    },
    [dispatch],
  );

  const doCreateWallet = useCallback(
    (pin: string) => {
      dispatch(
        walletActions.createWallet({
          pin,
          onDone: () => {
            popToTop();
            dispatch(toastActions.success());
            setTimeout(() => goBack(), 20);
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
            openSetupBiometryAfterRestore(pin, biometryType);
          } else {
            doCreateWallet(pin);
          }
        })
        .catch((err) => {
          console.log('ERR', err);
          debugLog('supportedAuthenticationTypesAsync', err.message);
          doCreateWallet(pin);
        });
    },
    [doCreateWallet],
  );

  const stepsStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(stepsValue.value, [0, 1], [0, -deviceWidth]),
        },
      ],
    };
  });

  return (
    <>
      <NavBar isCancelButton isTransparent />
      <S.Steps style={stepsStyle}>
        <S.Step>
          <S.ImportWrap style={{ paddingBottom: keyboardHeight }}>
            <ImportWalletForm onWordsFilled={handleWordsFilled} />
          </S.ImportWrap>
        </S.Step>
        <S.Step>
          <CreatePinForm onPinCreated={handlePinCreated} />
        </S.Step>
      </S.Steps>
    </>
  );
};
