import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

import * as S from './CreateWallet.style';
import { walletActions, walletSelector } from '$store/wallet';
import {Button, NavBar, Text} from '$uikit';
import { useTranslator } from '$hooks';
import { deviceWidth, ns, triggerNotificationSuccess } from '$utils';
import { openSecretWords } from '$navigation';

export const CreateWallet: FC = () => {
  const t = useTranslator();
  const dispatch = useDispatch();
  const { bottom } = useSafeAreaInsets();
  const { generatedVault } = useSelector(walletSelector);
  const [step, setStep] = useState(1);
  const iconRef = useRef<LottieView>(null);
  const checkIconRef = useRef<LottieView>(null);
  const slideAnimation = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(walletActions.generateVault());
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleDoneStep1Anim = useCallback(() => {
    setStep(2);
    checkIconRef.current?.play();
    triggerNotificationSuccess();
  }, [checkIconRef]);

  const handleDoneStep3Anim = useCallback(() => {
    iconRef.current?.play();
  }, []);

  useEffect(() => {
    if (step === 1) {
      if (generatedVault) {
        slideAnimation.value = withTiming(
          1,
          {
            duration: 350,
            easing: Easing.inOut(Easing.ease),
          },
          (isFinished) => {
            if (isFinished) {
              runOnJS(handleDoneStep1Anim)();
            }
          },
        );
      }
    } else if (step === 2) {
      slideAnimation.value = withDelay(
        2500,
        withTiming(
          2,
          {
            duration: 350,
            easing: Easing.inOut(Easing.ease),
          },
          (isFinished) => {
            if (isFinished) {
              runOnJS(handleDoneStep3Anim)();
            }
          },
        ),
      );
    }
  }, [generatedVault, step]);

  useEffect(() => {
    let timer: any = 0;
    if (step === 2) {
      timer = setTimeout(() => {
        setStep(3);
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [step]);

  const handleContinue = useCallback(() => {
    openSecretWords();
  }, []);

  const step1Style = useAnimatedStyle(() => ({
    opacity: interpolate(Math.min(slideAnimation.value, 1), [0, 1], [1, 0]),
    transform: [
      {
        translateX: interpolate(
          Math.min(slideAnimation.value, 1),
          [0, 1],
          [0, -deviceWidth],
        ),
      },
    ],
  }));

  const step2Style = useAnimatedStyle(() => ({
    opacity: interpolate(Math.min(slideAnimation.value, 2), [0, 1, 2], [0, 1, 0]),
    transform: [
      {
        translateX: interpolate(
          Math.min(slideAnimation.value, 2),
          [0, 1, 2],
          [deviceWidth, 0, -deviceWidth],
        ),
      },
    ],
  }));

  const step3Style = useAnimatedStyle(() => {
    const value = Math.min(Math.max(1, slideAnimation.value), 2);
    return {
      opacity: interpolate(value, [1, 2], [0, 1]),
      transform: [
        {
          translateX: interpolate(value, [1, 2], [deviceWidth, 0]),
        },
      ],
    };
  });

  return (
    <S.Wrap>
      <NavBar hideBackButton />
      <S.Step style={step1Style}>
        <S.Content>
          <S.LottieIcon
            source={require('$assets/lottie/gear.json')}
            loop={true}
            autoPlay={true}
            autoSize={false}
          />
          <S.TitleWrapper>
            <Text variant="h2" textAlign="center">
              {t('create_wallet_generating')}
            </Text>
          </S.TitleWrapper>
        </S.Content>
      </S.Step>
      <S.Step style={step2Style}>
        <S.Content>
          <S.LottieIcon
            ref={checkIconRef}
            source={require('$assets/lottie/check.json')}
            loop={false}
            autoPlay={false}
            autoSize={false}
          />
          <S.TitleWrapper>
            <Text variant="h2" textAlign="center">
              {t('create_wallet_generated')}
            </Text>
          </S.TitleWrapper>
        </S.Content>
      </S.Step>
      <S.Step style={step3Style}>
        <S.Content>
          <S.LottieIcon
            ref={iconRef}
            source={require('$assets/lottie/write.json')}
            loop={false}
            autoPlay={false}
            autoSize={false}
          />
          <S.TitleWrapper>
            <Text variant="h2" textAlign="center">
              {t('create_wallet_title')}
            </Text>
          </S.TitleWrapper>
          <S.CaptionWrapper>
            <Text variant="body1" color="foregroundSecondary" textAlign="center">
              {t('create_wallet_caption')}
            </Text>
          </S.CaptionWrapper>
        </S.Content>
        <S.ButtonWrap style={{ marginBottom: bottom + ns(16) }}>
          <Button onPress={handleContinue}>{t('create_wallet_continue_button')}</Button>
        </S.ButtonWrap>
      </S.Step>
    </S.Wrap>
  );
};
