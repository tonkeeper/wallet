import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { useDispatch } from 'react-redux';
import { useRoute } from '@react-navigation/native';

import { SetupBiometryProps } from './SetupBiometry.interface';
import * as S from './SetupBiometry.style';
import {Button, NavBar, Text} from '$uikit';
import { ns, platform } from '$utils';
import { goBack, openImportSetupNotifications, openSetupNotifications, openSetupWalletDone, popToTop, ResetPinStackRouteNames, SetupWalletStackRouteNames } from '$navigation';
import { walletActions } from '$store/wallet';
import { toastActions } from '$store/toast';
import { useTranslator } from '$hooks';
import { getPermission } from '$utils/messaging';

const LottieFaceId = require('$assets/lottie/faceid.json');
const LottieTouchId = require('$assets/lottie/touchid.json');

export const SetupBiometry: FC<SetupBiometryProps> = ({ route }) => {
  const { pin, biometryType } = route.params;

  const routeNode = useRoute();
  const dispatch = useDispatch();
  const t = useTranslator();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const iconRef = useRef<LottieView>(null);
  const isTouchId =
    biometryType !== LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION;
  const [isLoading, setLoading] = useState(false);

  useMemo(() => {
    const timer = setTimeout(() => {
      iconRef.current?.play();
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const doCreateWallet = useCallback(
    (isBiometryEnabled: boolean) => () => {
      dispatch(
        walletActions.createWallet({
          isBiometryEnabled,
          pin,
          onDone: async () => {
            if (routeNode.name === ResetPinStackRouteNames.SetupBiometry) {
              popToTop();
              dispatch(toastActions.success());
              setTimeout(() => goBack(), 20);
            } else {
              const hasNotificationPermission = await getPermission();
              if (hasNotificationPermission) {
                openSetupWalletDone();
              } else {
                if (routeNode.name === SetupWalletStackRouteNames.SetupBiometry) {
                  openSetupNotifications();
                } else {
                  openImportSetupNotifications();
                }
              }
            }
          },
          onFail: () => {
            setLoading(false);
          },
        }),
      );
    },
    [dispatch, pin],
  );

  const biometryName = useMemo(() => {
    return isTouchId
      ? t(`platform.${platform}.fingerprint_genitive`)
      : t(`platform.${platform}.face_recognition_genitive`);
  }, [t, isTouchId]);

  const handleEnable = useCallback(() => {
    setLoading(true);
    doCreateWallet(true)();
  }, [doCreateWallet]);

  return (
    <>
      <NavBar
        rightContent={
          <Button
            size="navbar_small"
            mode="secondary"
            style={{ marginRight: ns(16) }}
            onPress={doCreateWallet(false)}
          >
            {t('later')}
          </Button>
        }
      />
      <S.Wrap>
        <S.Content>
          <S.IconWrap>
            <LottieView
              ref={iconRef}
              source={isTouchId ? LottieTouchId : LottieFaceId}
              loop={false}
              autoPlay={false}
              autoSize={false}
            />
          </S.IconWrap>
          <Text variant="h2" textAlign="center">
            {t('setup_biometry_title', { biometryType: biometryName })}
          </Text>
          <S.CaptionWrapper>
            <Text color="foregroundSecondary" textAlign="center" variant="label1">
              {t('setup_biometry_caption', {
                biometryType: isTouchId
                  ? t(`platform.${platform}.capitalized_fingerprint`)
                  : t(`platform.${platform}.capitalized_face_recognition`)
              })}
            </Text>
          </S.CaptionWrapper>
        </S.Content>
        <S.Footer style={{ paddingBottom: bottomInset }}>
          <Button onPress={handleEnable} isLoading={isLoading}>
            {t('setup_biometry_enable_button', {
              biometryType: biometryName
            })}
          </Button>
        </S.Footer>
      </S.Wrap>
    </>
  );
};
