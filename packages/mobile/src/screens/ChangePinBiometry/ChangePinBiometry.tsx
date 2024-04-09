import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as S from './SetupBiometry.style';
import { Button, NavBar, Text } from '$uikit';
import { getBiometryName, ns } from '$utils';
import { t } from '@tonkeeper/shared/i18n';
import { Steezy } from '@tonkeeper/uikit';
import { useParams } from '$navigation/imperative';
import { useBiometrySettings } from '@tonkeeper/shared/hooks';
import { useNavigation } from '@tonkeeper/router';
import { BiometryType } from '$wallet/Biometry';

const LottieFaceId = require('$assets/lottie/faceid.json');
const LottieTouchId = require('$assets/lottie/touchid.json');

export const ChangePinBiometry: FC = () => {
  const { passcode } = useParams<{ passcode: string }>();
  const biometry = useBiometrySettings();
  const nav = useNavigation();

  const { bottom: bottomInset } = useSafeAreaInsets();
  const iconRef = useRef<LottieView>(null);
  const isFingerprint = biometry.type !== BiometryType.FaceRecognition;
  const [isLoading, setLoading] = useState(false);

  useMemo(() => {
    const timer = setTimeout(() => {
      iconRef.current?.play();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const handleEnable = useCallback(async () => {
    if (!passcode) {
      return;
    }

    setLoading(true);

    try {
      await biometry.enableBiometry(passcode);
      nav.goBack();
    } catch {
      setLoading(false);
    }
  }, [biometry, nav, passcode]);

  return (
    <>
      <NavBar
        rightContent={
          <Button
            size="navbar_small"
            mode="secondary"
            style={{ marginRight: ns(16) }}
            onPress={nav.goBack}
          >
            {t('later')}
          </Button>
        }
        hideBackButton
      />
      <S.Wrap>
        <S.Content>
          <LottieView
            style={styles.lottieIcon.static}
            ref={iconRef}
            source={isFingerprint ? LottieTouchId : LottieFaceId}
            loop={false}
            autoPlay={false}
          />
          <Text variant="h2" textAlign="center">
            {t('setup_biometry_title', {
              biometryType: getBiometryName(biometry.type, { genitive: true }),
            })}
          </Text>
          <S.CaptionWrapper>
            <Text color="foregroundSecondary" textAlign="center" variant="body1">
              {t('setup_biometry_caption', {
                biometryType: getBiometryName(biometry.type, { capitalized: true }),
              })}
            </Text>
          </S.CaptionWrapper>
        </S.Content>
        <S.Footer style={{ paddingBottom: bottomInset }}>
          <Button onPress={handleEnable} isLoading={isLoading}>
            {t('setup_biometry_enable_button', {
              biometryType: getBiometryName(biometry.type, { accusative: true }),
            })}
          </Button>
        </S.Footer>
      </S.Wrap>
    </>
  );
};

const styles = Steezy.create({
  lottieIcon: {
    width: 160,
    height: 160,
  },
});
