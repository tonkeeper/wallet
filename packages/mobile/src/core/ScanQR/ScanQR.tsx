import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import {
  check,
  PERMISSIONS,
  RESULTS,
  request,
  openSettings,
} from 'react-native-permissions';
import { Platform, StatusBar } from 'react-native';
import { ScanQRProps } from './ScanQR.interface';
import * as S from './ScanQR.style';
import { Button, Icon, NavBar, Text } from '$uikit';
import {
  delay,
  deviceHeight,
  isIOS,
  ns,
  triggerImpactLight,
  triggerNotificationSuccess,
  triggerSelection,
} from '$utils';
import { BottomButtonWrap, BottomButtonWrapHelper } from '$shared/components';
import { useNavigation } from '@tonkeeper/router';
import { t } from '@tonkeeper/shared/i18n';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { DarkTheme } from '@tonkeeper/uikit/src/styles/themes/dark';
import { useTheme } from '@tonkeeper/uikit';

export const ScanQR: FC<ScanQRProps> = ({ route }) => {
  const nav = useNavigation();
  const onScan = route.params.onScan;
  const scannerRef = useRef<QRCodeScanner>(null);

  const theme = useTheme();

  const [isFlashlightOn, setFlashlightOn] = useState(false);
  const [isCameraBlocked, setCameraBlocked] = useState(false);
  const [isHasPermission, setHasPermissions] = useState(false);

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

  const toggleLanternHandle = useCallback(() => {
    if (!isFlashlightOn) {
      triggerImpactLight();
    } else {
      triggerSelection();
    }
    setFlashlightOn(!isFlashlightOn);
  }, [isFlashlightOn]);

  const handleBack = useCallback(() => {
    nav.goBack();
  }, []);

  const handleOpenSettings = useCallback(() => {
    openSettings();
  }, []);

  const onSuccess = async (e: any) => {
    if (e.data) {
      // ton://transfer/EQCsgTsYweyHBz3cqmo75FqRxbVUQhxG6yBS5zQNVQHa5SZT
      const sloved = await onScan(e.data);
      if (sloved) {
        triggerNotificationSuccess();
        nav.goBack();
      } else {
        await delay(400);
        scannerRef.current?.reactivate();
      }
    }
  };

  function renderContent() {
    if (isCameraBlocked) {
      return (
        <S.ErrorWrap>
          <NavBar isBottomButton />
          <S.ErrorContent>
            <Icon name="ic-camera-84" color="accentPrimary" />
            <S.ErrorTextWrapper>
              <Text variant="h2" textAlign="center">
                {t('scan_qr_permission_error')}
              </Text>
            </S.ErrorTextWrapper>
          </S.ErrorContent>
          <BottomButtonWrapHelper />
          <BottomButtonWrap>
            <Button onPress={handleOpenSettings} style={{ marginHorizontal: ns(16) }}>
              {t('scan_qr_open_settings')}
            </Button>
          </BottomButtonWrap>
        </S.ErrorWrap>
      );
    }

    return (
      <S.Wrap>
        <StatusBar barStyle="light-content" />
        <S.CloseButtonWrap onPress={handleBack}>
          <S.CloseButton>
            {isIOS && <S.BlurNode />}
            <Icon name="ic-chevron-down-16" color="constantLight" style={{ zIndex: 2 }} />
          </S.CloseButton>
        </S.CloseButtonWrap>
        {isHasPermission && (
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
        )}

        <S.OverlayContainer>
          <S.TitleWrapper>
            <Text
              textAlign="center"
              numberOfLines={1}
              allowFontScaling={false}
              color="constantLight"
              variant="h2"
            >
              {t('scan_qr_title')}
            </Text>
          </S.TitleWrapper>

          <S.PseudoRect />

          <S.Rect>
            <S.LeftTopCorner>
              <S.CornerHelper />
              <S.CornerImage />
            </S.LeftTopCorner>
            <S.RightTopCorner>
              <S.CornerHelper />
              <S.CornerImage />
            </S.RightTopCorner>
            <S.RightBottomCorner>
              <S.CornerHelper />
              <S.CornerImage />
            </S.RightBottomCorner>
            <S.LeftBottomCorner>
              <S.CornerHelper />
              <S.CornerImage />
            </S.LeftBottomCorner>
          </S.Rect>
          <S.MaskOuter>
            <S.MaskRow />
            <S.MaskCenter>
              <S.MaskOverlay />
              <S.MaskInner />
              <S.MaskOverlay />
            </S.MaskCenter>
            <S.MaskRow />
          </S.MaskOuter>

          <S.FlashlightButton onPress={toggleLanternHandle}>
            {isFlashlightOn ? (
              <S.FlashlightButtonCont>
                <Icon name="ic-flashlight-off-56" color="constantDark" />
              </S.FlashlightButtonCont>
            ) : (
              <S.FlashlightButtonContBlur>
                {isIOS && <S.BlurNode />}
                <Icon
                  name="ic-flashlight-on-56"
                  color="constantLight"
                  style={{ zIndex: 2 }}
                />
              </S.FlashlightButtonContBlur>
            )}
          </S.FlashlightButton>
        </S.OverlayContainer>
      </S.Wrap>
    );
  }

  return <>{renderContent()}</>;
};
