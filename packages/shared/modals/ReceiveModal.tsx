import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text as NativeText, Share } from 'react-native';
import QRCode from 'react-native-qrcode-styled';
import { tk } from '../tonkeeper';
import { t } from '../i18n';
import {
  TransitionOpacity,
  SegmentedControl,
  copyText,
  TonIcon,
  Button,
  Spacer,
  Modal,
  View,
  Text,
  Icon,
} from '@tonkeeper/uikit';

enum Segments {
  Ton = 0,
  Tron = 1,
}

export const ReceiveModal = memo(() => {
  const [qrRender1, setQrRender1] = useState(false);
  const [qrRender2, setQrRender2] = useState(false);
  const [segmentIndex, setSegmentIndex] = useState(Segments.Ton);

  // For quick open screen
  useEffect(() => {
    setTimeout(() => setQrRender1(true), 0);
    setTimeout(() => setQrRender2(true), 100);
  }, []);

  const tonAddress = tk.wallet.address.ton.friendly;
  const tronAddress = tk.wallet.address.tron?.proxy;

  const segments = useMemo(() => {
    const items = ['TON'];

    if (tronAddress) {
      items.push('TRC20');
    }

    return items;
  }, [tronAddress]);

  const address2url = useCallback((addr: string) => {
    return 'ton://transfer/' + addr;
  }, []);

  const share = useCallback(
    (address: string) => () => {
      Share.share({
        message: address,
      }).catch((err) => {
        console.log('cant share', err);
      });
    },
    [],
  );

  return (
    <Modal>
      <Modal.Header
        title={
          <SegmentedControl
            onChange={(segment) => setSegmentIndex(segment)}
            index={segmentIndex}
            items={segments}
          />
        }
      />
      <Modal.Content>
        <TransitionOpacity
          isVisible={segmentIndex === Segments.Ton}
          entranceAnimation={false}
          style={styles.transition}
          duration={0}
          delay={0}
          alwaysShown
        >
          <View style={styles.description}>
            <Text type="h3" textAlign="center">
              Receive Toncoin
            </Text>
            <Spacer y={4} />
            <Text type="body1" color="textSecondary" textAlign="center">
              Send only Toncoin TON and tokens in TON network to this address, or you
              might lose your funds.
            </Text>
          </View>
          <View style={styles.qrCodeContainer}>
            {qrRender1 ? (
              <>
                <QRCode
                  data={address2url(tonAddress)}
                  style={styles.qrCode}
                  logo={blankAreaForLogo}
                  pieceSize={6.245}
                  width={231}
                />
                <View style={styles.qrLogo}>
                  <TonIcon size="small" />
                </View>
              </>
            ) : (
              <View style={styles.emptyQrArea} />
            )}
            <NativeText style={styles.addressText}>{tonAddress}</NativeText>
          </View>
          <View style={styles.buttons}>
            <Button
              leftContent={<Icon name="ic-copy-16" />}
              onPress={copyText(tonAddress, t('address_copied'))}
              color="secondary"
              title="Copy"
              size="medium"
            />
            <Spacer x={12} />
            <Button
              leftContent={<Icon name="ic-share-16" />}
              onPress={share(tonAddress)}
              color="secondary"
              title="Share"
              size="medium"
            />
          </View>
        </TransitionOpacity>
        <TransitionOpacity
          isVisible={segmentIndex === Segments.Tron && !!tronAddress}
          style={styles.transition}
          duration={0}
          delay={0}
          alwaysShown
        >
          <View style={styles.description}>
            <Text type="h3" textAlign="center">
              Receive USDT TRC20
            </Text>
            <Spacer y={4} />
            <Text type="body1" color="textSecondary" textAlign="center">
              Send only USDT TRC20 to this address, or you might lose your funds.
            </Text>
          </View>
          <View style={styles.qrCodeContainer}>
            {qrRender2 ? (
              <>
                <QRCode
                  data={tronAddress}
                  style={styles.qrCode}
                  logo={blankAreaForLogo}
                  pieceSize={8}
                />
                <View style={styles.qrLogo}>
                  <Icon name="ic-usdt-56" colorless size={44} />
                </View>
              </>
            ) : (
              <View style={styles.emptyQrArea} />
            )}
            <NativeText style={styles.addressText}>{tronAddress}</NativeText>
          </View>
          <View style={styles.buttons}>
            <Button
              leftContent={<Icon name="ic-copy-16" />}
              onPress={copyText(tronAddress, t('address_copied'))}
              color="secondary"
              title="Copy"
              size="medium"
            />
            <Spacer x={12} />
            <Button
              leftContent={<Icon name="ic-share-16" />}
              onPress={share(tronAddress!)}
              color="secondary"
              title="Share"
              size="medium"
            />
          </View>
        </TransitionOpacity>
      </Modal.Content>
    </Modal>
  );
});

const styles = StyleSheet.create({
  qrCodeContainer: {
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
    // width: 351
  },
  qrLogo: {
    position: 'absolute',
    zIndex: 1,
    top: 126,
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

const whitepng =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE4AAABOAQMAAAC0ZLJeAAAAA1BMVEX///+nxBvIAAAAEElEQVQYGWMYBaNgFNAAAAADWgABYd4igAAAAABJRU5ErkJggg==';
const blankAreaForLogo = { width: 78, height: 78, href: whitepng, scale: 2.3 };
