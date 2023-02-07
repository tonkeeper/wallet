import React, { FC, useCallback, useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { useDispatch } from 'react-redux';

import * as S from './SecurityMigration.style';
import {Button, Text} from '$uikit';
import { ns, platform } from '$utils';
import { useTranslator } from '$hooks';
import { goBack } from '$navigation';
import { walletActions } from '$store/wallet';

export const SecurityMigration: FC = () => {
  const t = useTranslator();
  const dispatch = useDispatch();
  const iconRef = useRef<LottieView>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      iconRef.current?.play();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleMigrate = useCallback(() => {
    dispatch(walletActions.securityMigrate());
  }, [dispatch]);

  const handleSkip = useCallback(() => {
    goBack();
  }, []);

  return (
    <S.Wrap>
      <S.Info>
        <S.LottieIcon
          ref={iconRef}
          source={require('$assets/lottie/shield.json')}
          loop={false}
          autoPlay={false}
          autoSize={false}
        />
        <S.TitleWrapper>
          <Text variant="h2" style={{ textAlign: 'center' }}>
            {t('security_migration_title')}
          </Text>
        </S.TitleWrapper>
        <S.CaptionWrapper>
          <Text color="foregroundSecondary" variant="body1" style={{ textAlign: 'center' }}>
            {t('security_migration_caption', {
              faceRecognition: t(`platform.${platform}.face_recognition`)
            })}
          </Text>
        </S.CaptionWrapper>
      </S.Info>
      <S.Footer>
        <Button onPress={handleMigrate}>{t('security_migration_submit_button')}</Button>
        <Button style={{ marginTop: ns(16) }} onPress={handleSkip} mode="secondary">
          {t('security_migration_skip_button')}
        </Button>
      </S.Footer>
    </S.Wrap>
  );
};
