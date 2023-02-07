import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSelector } from 'react-redux';

import * as S from './CreatePinForm.style';
import { InlineKeyboard, PinCode } from '$uikit';
import { PinCodeRef } from '$uikit/PinCode/PinCode.interface';
import { deviceWidth } from '$utils';
import { CreatePinFormProps } from './CreatePinForm.interface';
import { walletWalletSelector } from '$store/wallet';
import { useTranslator } from '$hooks';

export const CreatePinForm: FC<CreatePinFormProps> = (props) => {
  const { onPinCreated, validateOldPin = false, onVaultUnlocked } = props;

  const t = useTranslator();
  const wallet = useSelector(walletWalletSelector);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const pinRef = useRef<PinCodeRef>(null);
  const oldPinRef = useRef<PinCodeRef>(null);
  const [step, setStep] = useState(validateOldPin ? 0 : 1);
  const [value0, setValue0] = useState('');
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');
  const [isAnimating, setAnimation] = useState(false);

  const stepsValue = useSharedValue(validateOldPin ? -1 : 0);

  useFocusEffect(
    useCallback(() => {
      setStep(validateOldPin ? 0 : 1);
      setValue0('');
      setValue1('');
      setValue2('');
      pinRef.current?.clearState();
      oldPinRef.current?.clearState;
    }, [validateOldPin]),
  );

  const onStepAnimationCompleted = useCallback(() => {
    setValue2('');
    setAnimation(false);
  }, []);

  useEffect(() => {
    setAnimation(true);

    let newVal = 0;
    if (step === 0) {
      newVal = -1;
    } else if (step === 2) {
      newVal = 1;
    }

    stepsValue.value = withDelay(
      500,
      withTiming(
        newVal,
        {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        },
        (finished) => {
          if (finished) {
            runOnJS(onStepAnimationCompleted)();
          }
        },
      ),
    );
  }, [onStepAnimationCompleted, step, stepsValue]);

  const handleKeyboard = useCallback(
    (newValue) => {
      const pin = newValue.substr(0, 4);

      if (step === 0) {
        setValue0(pin);
        if (pin.length === 4) {
          setTimeout(() => {
            wallet!.vault
              .getEncrypted()
              .then((encryptedVault) => {
                encryptedVault
                  .decrypt(pin)
                  .then((unlockedVault) => {
                    oldPinRef.current?.triggerSuccess();
                    onVaultUnlocked && onVaultUnlocked(unlockedVault);

                    setTimeout(() => {
                      setStep(1);
                    }, 500);
                  })
                  .catch(() => {
                    oldPinRef.current?.triggerError();
                    setValue0('');
                  });
              })
              .catch(() => {
                oldPinRef.current?.triggerError();
                setValue0('');
              });
          }, 300);
        }
      } else if (step === 1) {
        setValue1(pin);
        if (pin.length === 4) {
          setStep(2);
        }
      } else if (step === 2) {
        setValue2(pin);
        if (pin.length === 4) {
          if (value1 === pin) {
            setTimeout(() => {
              pinRef.current?.triggerSuccess();

              // wait pulse animation completion
              setTimeout(() => {
                onPinCreated(pin);
              }, 350);
            }, 500);
          } else {
            setTimeout(() => {
              setValue1('');
              setValue2('');
              pinRef.current?.triggerError();
              setTimeout(() => {
                setStep(1);
              }, 450);
            }, 500);
          }
        }
      }
    },
    [onPinCreated, onVaultUnlocked, step, value1, wallet],
  );

  const stepsStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            stepsValue.value,
            [-1, 0, 1],
            [0, -deviceWidth, -deviceWidth * 2],
          ),
        },
      ],
    };
  });

  const value = useMemo(() => {
    if (step === 0) {
      return value0;
    } else if (step === 1) {
      return value1;
    } else {
      return value2;
    }
  }, [step, value0, value1, value2]);

  return (
    <S.Content style={{ paddingBottom: bottomInset }}>
      <S.Steps style={stepsStyle}>
        <S.Step>
          <S.PinWrap>
            <S.Title>{t('create_pin_current_title')}</S.Title>
            <S.Pin>
              <PinCode value={value0} ref={oldPinRef} />
            </S.Pin>
          </S.PinWrap>
        </S.Step>
        <S.Step>
          <S.PinWrap>
            <S.Title>{t('create_pin_new_title')}</S.Title>
            <S.Pin>
              <PinCode value={value1} />
            </S.Pin>
          </S.PinWrap>
        </S.Step>
        <S.Step>
          <S.PinWrap>
            <S.Title>{t('create_pin_repeat_title')}</S.Title>
            <S.Pin>
              <PinCode value={value2} ref={pinRef} />
            </S.Pin>
          </S.PinWrap>
        </S.Step>
      </S.Steps>
      <InlineKeyboard onChange={handleKeyboard} value={value} disabled={isAnimating} />
    </S.Content>
  );
};
