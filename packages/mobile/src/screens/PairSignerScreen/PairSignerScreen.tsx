import {
  Button,
  Haptics,
  Icon,
  Screen,
  Spacer,
  Steezy,
  Text,
  Theme,
  ThemeProvider,
  View,
  deviceHeight,
  isIOS,
  useTheme,
} from '@tonkeeper/uikit';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform, StatusBar } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import { DarkTheme } from '@tonkeeper/uikit/src/styles/themes/dark';
import * as S from '../../core/ScanQR/ScanQR.style';
import { config } from '$config';
import { DeeplinkOrigin, useDeeplinking } from '$libs/deeplinking';
import { delay } from '@tonkeeper/core';
import { useIsFocused } from '@react-navigation/native';
import { useFocusEffect } from '@tonkeeper/router';
import { ScannerMask } from '$core/ScanQR/ScannerMask';
import { t } from '@tonkeeper/shared/i18n';
import SystemNavigationBar from 'react-native-system-navigation-bar';

const SIGNER_SCHEME = 'tonsign://';

const CameraTheme: Theme = {
  ...DarkTheme,
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.64)',
  buttonPrimaryBackground: '#FFFFFF',
  buttonPrimaryBackgroundHighlighted: 'rgba(255, 255, 255, 0.8)',
  buttonPrimaryForeground: '#000000',
  buttonSecondaryBackground: 'rgba(255, 255, 255, 0.08)',
  buttonSecondaryBackgroundHighlighted: 'rgba(255, 255, 255, 0.24)',
  buttonSecondaryForeground: '#FFFFFF',
};

export const PairSignerScreen: FC = () => {
  const theme = useTheme();

  const deeplinking = useDeeplinking();

  const scannerRef = useRef<QRCodeScanner>(null);

  const [isFlashlightOn, setFlashlightOn] = useState(false);
  const [isCameraBlocked, setCameraBlocked] = useState(false);
  const [isHasPermission, setHasPermissions] = useState(false);

  const isFocused = useIsFocused();

  const toggleLanternHandle = useCallback(() => {
    if (!isFlashlightOn) {
      Haptics.impactLight();
    } else {
      Haptics.selection();
    }
    setFlashlightOn(!isFlashlightOn);
  }, [isFlashlightOn]);

  const openAbout = useCallback(() => {
    Linking.openURL(config.get('signer_about_url')).catch(null);
  }, []);

  const openSigner = useCallback(async () => {
    try {
      await Linking.openURL(SIGNER_SCHEME);
    } catch {
      Linking.openURL(config.get('signer_store_url')).catch(null);
    }
  }, []);

  const onSuccess = async (e: any) => {
    if (e.data) {
      const resolver = deeplinking.getResolver(e.data, {
        delay: 200,
        origin: DeeplinkOrigin.QR_CODE,
      });
      if (e.data.startsWith('tonkeeper://signer/link') && resolver) {
        resolver();
        Haptics.notificationSuccess();
      } else {
        await delay(400);
        scannerRef.current?.reactivate();
      }
    }
  };

  useFocusEffect(() => {
    scannerRef.current?.reactivate();
  });

  useEffect(() => {
    const permissionName = Platform.select({
      android: PERMISSIONS.ANDROID.CAMERA,
      ios: PERMISSIONS.IOS.CAMERA,
      default: PERMISSIONS.IOS.CAMERA,
    });

    check(permissionName).then((result) => {
      if (result === RESULTS.GRANTED) {
        setHasPermissions(true);
      } else if (result === RESULTS.DENIED) {
        request(permissionName)
          .then((res) => {
            if (res === RESULTS.GRANTED) {
              setHasPermissions(true);
            } else {
              setCameraBlocked(true);
            }
          })
          .catch(() => {
            setCameraBlocked(true);
          });
      } else {
        setCameraBlocked(true);
      }
    });
  }, []);

  useEffect(() => {
    SystemNavigationBar.setNavigationColor(
      DarkTheme.backgroundPageAlternate,
      'light',
      'navigation',
    );

    return () => {
      SystemNavigationBar.setNavigationColor(
        theme.backgroundPageAlternate,
        theme.isDark ? 'light' : 'dark',
        'navigation',
      );
    };
  }, [theme.backgroundPageAlternate, theme.isDark]);

  return (
    <ThemeProvider theme={CameraTheme}>
      {isFocused ? <StatusBar barStyle="light-content" /> : null}
      <Screen>
        {isHasPermission && (
          <View style={styles.cameraContainer}>
            <QRCodeScanner
              ref={scannerRef}
              vibrate={false}
              onRead={onSuccess}
              containerStyle={{
                flex: 1,
                padding: 0,
                margin: 0,
                height: deviceHeight,
              }}
              cameraStyle={{
                height: deviceHeight,
              }}
              flashMode={
                isFlashlightOn
                  ? RNCamera.Constants.FlashMode.torch
                  : RNCamera.Constants.FlashMode.off
              }
            />
          </View>
        )}
        <S.OverlayContainer>
          <View style={styles.topContainer}>
            <Text type="h2" textAlign="center">
              {t('pairSigner.title')}
            </Text>
            <Spacer y={4} />
            <Text textAlign="center" color="textSecondary">
              {t('pairSigner.subtitle')}
            </Text>
            <Spacer y={32} />
          </View>
          <S.PseudoRect />
          <View style={styles.bottomContainer}>
            <S.FlashlightButton onPress={toggleLanternHandle}>
              {isFlashlightOn ? (
                <S.FlashlightButtonCont>
                  <Icon name="ic-flashlight-off-56" color="constantBlack" />
                </S.FlashlightButtonCont>
              ) : (
                <S.FlashlightButtonContBlur>
                  {isIOS && <S.BlurNode />}
                  <Icon
                    name="ic-flashlight-on-56"
                    color="constantWhite"
                    style={{ zIndex: 2 }}
                  />
                </S.FlashlightButtonContBlur>
              )}
            </S.FlashlightButton>
          </View>

          <ScannerMask />
        </S.OverlayContainer>
        <Screen.Header
          rightContent={
            <View style={styles.headerButtonContainer}>
              <Button
                size="header"
                color="secondary"
                title={t('pairSigner.about')}
                onPress={openAbout}
              />
            </View>
          }
          trasnparent
        />
        <View style={styles.buttonContainer}>
          <Button title={t('pairSigner.open_signer')} onPress={openSigner} />
        </View>
      </Screen>
    </ThemeProvider>
  );
};

const styles = Steezy.create(({ colors, safeArea }) => ({
  headerButtonContainer: {
    marginRight: 16,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 48,
    zIndex: 3,
    justifyContent: 'flex-end',
  },
  bottomContainer: {
    flex: 1,
    zIndex: 3,
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: safeArea.bottom,
    paddingBottom: 32,
    paddingHorizontal: 32,
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.constantBlack,
  },
}));
