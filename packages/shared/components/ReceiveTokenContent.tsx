import { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text as NativeText, Share } from 'react-native';
import QRCode from 'react-native-qrcode-styled';
import { throttle } from '@tonkeeper/router';
import { t } from '../i18n';
import {
  TouchableOpacity,
  Pressable,
  copyText,
  Steezy,
  Button,
  Spacer,
  View,
  Text,
  Icon,
} from '@tonkeeper/uikit';

interface ReceiveTokenContentProps {
  address: string;
  renderDelay?: number;
  logo: React.ReactNode;
  qrAddress?: string;
  title: string;
  description: string;
  qrCodeScale: number;
}

export const ReceiveTokenContent = memo<ReceiveTokenContentProps>((props) => {
  const {
    address,
    renderDelay = 0,
    logo,
    qrAddress,
    description,
    title,
    qrCodeScale,
  } = props;

  const [render, setRender] = useState(renderDelay > 0 ? false : true);

  useEffect(() => {
    if (renderDelay > 0) {
      setTimeout(() => setRender(true), renderDelay);
    }
  }, [renderDelay]);

  const share = useCallback(
    (address: string) =>
      throttle(() => {
        Share.share({
          message: address,
        }).catch((err) => {
          console.log('cant share', err);
        });
      }, 1000),
    [],
  );

  return (
    <View>
      <View style={styles.description}>
        <Text type="h3" textAlign="center">
          {title}
        </Text>
        <Spacer y={4} />
        <Text type="body1" color="textSecondary" textAlign="center">
          {description}
        </Text>
      </View>
      <View style={styles.qrCodeArea}>
        {render ? (
          <View style={styles.qrCodeContainer}>
            <View style={{ transform: [{ scale: qrCodeScale }] }}>
              <QRCode data={qrAddress ?? address} style={styles.qrCode} pieceSize={8} />
            </View>
            <View style={steezyStyles.logoContainer}>{logo}</View>
          </View>
        ) : (
          <View style={styles.emptyQrArea} />
        )}
        <TouchableOpacity onPress={copyText(address, t('address_copied'))}>
          <NativeText style={styles.addressText} allowFontScaling={false}>
            {address}
          </NativeText>
        </TouchableOpacity>
      </View>
      <View style={styles.buttons}>
        <Button
          leftContent={<Icon name="ic-copy-16" />}
          onPress={copyText(address, t('address_copied'))}
          color="secondary"
          title={t('receiveModal.copy')}
          size="medium"
        />
        <Spacer x={12} />
        <Pressable style={steezyStyles.shareButton} onPress={share(address)}>
          <Icon name="ic-share-16" />
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  qrCodeContainer: {
    width: 231,
    height: 231,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCodeArea: {
    position: 'relative',
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingTop: 32,
    borderRadius: 20,
    alignSelf: 'center',
    width: 296,
  },
  qrCode: {
    backgroundColor: '#FFF',
  },
  emptyQrArea: {
    height: 231,
  },
  description: {
    marginTop: 32,
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressText: {
    paddingHorizontal: 28,
    paddingTop: 21,
    paddingBottom: 24,
    fontFamily: 'SFMono-Medium',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  transition: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});

const steezyStyles = Steezy.create(({ colors }) => ({
  logoContainer: {
    position: 'absolute',
    zIndex: 1,
    padding: 8,
    backgroundColor: colors.constantWhite,
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 48 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.buttonSecondaryBackground,
  },
}));
