import React, { FC, useCallback, useMemo, useRef } from 'react';
import LottieView from 'lottie-react-native';

import { Icon, Text } from '$uikit';
import * as CreateWalletStyle from '$core/CreateWallet/CreateWallet.style';
import { useTheme } from '$hooks/useTheme';
import { SetupWalletStackRouteNames } from '$navigation';
import { getCurrentRoute, goBack, popToTop } from '$navigation/imperative';
import * as S from './SetupWalletDone.style';
import { ns, triggerNotificationSuccess } from '$utils';
import { t } from '@tonkeeper/shared/i18n';

export const SetupWalletDone: FC = () => {
  const theme = useTheme();

  const confettiRef = useRef<LottieView>(null);
  const checkIconRef = useRef<LottieView>(null);

  useMemo(() => {
    const timer = setTimeout(() => {
      confettiRef.current?.play();
      checkIconRef.current?.play();

      triggerNotificationSuccess();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleAnimationEnd = useCallback(() => {
    const timer = setTimeout(() => {
      const isCreate =
        getCurrentRoute()?.name === SetupWalletStackRouteNames.SetupWalletDone;
      popToTop();
      if (isCreate) {
        setTimeout(() => goBack(), 10);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <CreateWalletStyle.Content style={{ marginTop: -ns(16) }}>
        <S.LottieIcon
          ref={checkIconRef}
          source={require('$assets/lottie/check480.json')}
          loop={false}
          autoPlay={false}
          autoSize={false}
        />
        <S.TitleWrapper>
          <Text variant="h2" textAlign="center">
            {t('check_words_success')}
          </Text>
        </S.TitleWrapper>
      </CreateWalletStyle.Content>
      <S.AnimationWrap>
        <LottieView
          ref={confettiRef}
          source={require('$assets/lottie/confetti.json')}
          loop={false}
          autoPlay={false}
          autoSize={false}
          onAnimationFinish={handleAnimationEnd}
        />
      </S.AnimationWrap>
    </>
  );
};
