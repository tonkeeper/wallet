import {
  Haptics,
  Modal,
  Spacer,
  Steezy,
  Text,
  View,
  ViewStyle,
  deviceWidth,
  ns,
} from '@tonkeeper/uikit';
import { useEffect, useMemo, useRef } from 'react';
import { tk } from '$wallet';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { DeeplinkOrigin, useDeeplinking } from '$libs/deeplinking';
import { useParams } from '@tonkeeper/router/src/imperative';
import { t } from '@tonkeeper/shared/i18n';
import { ScannerMask } from '$core/ScanQR/ScannerMask';
import { delay } from '@tonkeeper/core';
import { QR_WRAP_STYLE, QrCodeView } from './QrCodeView';
import Animated, {
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const NEXT_DELAY = 185;

function getChunks(input: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < input.length; i += chunkSize) {
    chunks.push(input.substring(i, i + chunkSize));
  }
  return chunks;
}

const SCANNER_SIZE = deviceWidth - ns(16) * 2;

const SCANNER_STYLE: ViewStyle = {
  width: SCANNER_SIZE,
  height: SCANNER_SIZE,
};

interface Params {
  walletIdentifier: string;
  deeplink: string;
  onClose: () => void;
}

export const SignerConfirmScreen = () => {
  const { walletIdentifier, deeplink, onClose } = useParams<Params>();

  const scannerRef = useRef<QRCodeScanner>(null);

  const deeplinking = useDeeplinking();

  const chunks = useMemo(() => getChunks(deeplink, 256), [deeplink]);

  const currentChunkIndex = useSharedValue(0);

  useEffect(() => {
    return () => {
      const wallet = tk.wallets.get(walletIdentifier);

      if (wallet && !wallet.signer.isSignerResolved) {
        onClose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletIdentifier]);

  const onSuccess = async (e: any) => {
    if (e.data) {
      const resolver = deeplinking.getResolver(e.data, {
        delay: 200,
        origin: DeeplinkOrigin.QR_CODE,
      });
      if (e.data.startsWith('tonkeeper://publish') && resolver) {
        resolver();
        Haptics.notificationSuccess();
      } else {
        await delay(400);
        scannerRef.current?.reactivate();
      }
    }
  };

  useEffect(() => {
    if (chunks.length > 0) {
      currentChunkIndex.value = withRepeat(
        withSequence(
          ...chunks.map((_, index) =>
            withDelay(NEXT_DELAY, withTiming(index, { duration: 0 })),
          ),
        ),
        -1,
      );
    }
  }, [chunks, currentChunkIndex]);

  return (
    <Modal>
      <Modal.Header title={t('signerConfirm.title')} titlePosition="left" />
      <Modal.ScrollView>
        <View style={styles.container}>
          <View style={styles.step}>
            <View style={styles.textContainer}>
              <Text color="textSecondary">{t('signerConfirm.step', { value: 1 })}</Text>
              <Text type="label1">{t('signerConfirm.scan_qr')}</Text>
            </View>
          </View>
          <Spacer y={16} />
          <View style={styles.qrCodeContainer}>
            <View style={QR_WRAP_STYLE}>
              {chunks.map((chunk, index) => (
                <Animated.View style={styles.qrChunk.static} key={chunk}>
                  <QrCodeView
                    index={index}
                    data={chunk}
                    currentChunkIndex={currentChunkIndex}
                  />
                </Animated.View>
              ))}
            </View>
          </View>
          <Spacer y={16} />
          <View style={styles.step}>
            <View style={styles.textContainer}>
              <Text color="textSecondary">{t('signerConfirm.step', { value: 2 })}</Text>
              <Text type="label1">{t('signerConfirm.confirm')}</Text>
            </View>
          </View>
          <Spacer y={16} />
          <View style={styles.step}>
            <View style={styles.textContainer}>
              <Text color="textSecondary">{t('signerConfirm.step', { value: 3 })}</Text>
              <Text type="label1">{t('signerConfirm.scan_signed_qr')}</Text>
            </View>
            <View style={[styles.cameraContainer, SCANNER_STYLE]}>
              <QRCodeScanner
                ref={scannerRef}
                vibrate={false}
                onRead={onSuccess}
                containerStyle={styles.camera.static}
              />
              <ScannerMask />
            </View>
          </View>
        </View>
        <View style={styles.safeArea} />
      </Modal.ScrollView>
    </Modal>
  );
};

const styles = Steezy.create(({ colors, corners, safeArea }) => ({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  step: {
    backgroundColor: colors.backgroundContent,
    borderRadius: corners.medium,
    overflow: 'hidden',
  },
  textContainer: {
    padding: 16,
  },
  qrCodeContainer: {
    backgroundColor: '#FFE26B',
    borderRadius: corners.medium,
    paddingVertical: 24,
    alignItems: 'center',
  },
  qrChunk: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cameraContainer: {
    backgroundColor: colors.constantBlack,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    height: safeArea.bottom,
  },
}));
