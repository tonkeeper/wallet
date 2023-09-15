import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text as NativeText, Share } from 'react-native';
import QRCode from 'react-native-qrcode-styled';
import { tk } from '../tonkeeper';
import { t } from '../i18n';
import {
  TransitionOpacity,
  SegmentedControl,
  copyText,
  Button,
  Spacer,
  Modal,
  View,
  Text,
  Icon,
  TonIcon,
  Pressable,
  Steezy,
} from '@tonkeeper/uikit';

enum Segments {
  Ton = 0,
  Tron = 1,
}

export const ReceiveModal = memo(() => {
  const [segmentIndex, setSegmentIndex] = useState(Segments.Ton);

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
          segments.length > 1 ? (
            <SegmentedControl
              onChange={(segment) => setSegmentIndex(segment)}
              index={segmentIndex}
              items={segments}
            />
          ) : undefined
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
              {t('receiveModal.receive')} Toncoin
            </Text>
            <Spacer y={4} />
            <Text type="body1" color="textSecondary" textAlign="center">
              {t('receiveModal.receive_ton')}
            </Text>
          </View>
          <QrCode
            logo={<TonIcon size="small" />}
            qrAddress={address2url(tonAddress)}
            address={tonAddress}
            pieceSize={6.245}
            width={231}
          />
          <View style={styles.buttons}>
            <Button
              leftContent={<Icon name="ic-copy-16" />}
              onPress={copyText(tonAddress, t('address_copied'))}
              color="secondary"
              title={t('receiveModal.copy')}
              size="medium"
            />
            <Spacer x={12} />
            <Pressable style={steezyStyles.shareButton} onPress={share(tonAddress)}>
              <Icon name="ic-share-16" />
            </Pressable>
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
          {tronAddress && (
            <QrCode
              logo={<Icon name="ic-usdt-56" colorless size={44} />}
              qrAddress={tronAddress}
              address={tronAddress}
              renderDelay={100}
              pieceSize={8}
            />
          )}
          <View style={styles.buttons}>
            <Button
              leftContent={<Icon name="ic-copy-16" />}
              onPress={copyText(tronAddress, t('address_copied'))}
              color="secondary"
              title="Copy"
              size="medium"
            />
            <Spacer x={12} />
            <Pressable style={steezyStyles.shareButton} onPress={share(tronAddress!)}>
              <Icon name="ic-share-16" />
            </Pressable>
          </View>
        </TransitionOpacity>
      </Modal.Content>
    </Modal>
  );
});

interface QrCodeProps {
  address: string;
  renderDelay?: number;
  logo: React.ReactNode;
  qrAddress?: string;
  pieceSize?: number;
  width?: number;
}

const QrCode = memo<QrCodeProps>((props) => {
  const { address, renderDelay = 0, logo, qrAddress, pieceSize, width } = props;
  const [render, setRender] = useState(renderDelay > 0 ? false : true);

  useEffect(() => {
    if (renderDelay > 0) {
      setTimeout(() => setRender(true), renderDelay);
    }
  }, [renderDelay]);

  return (
    <View style={styles.qrCodeContainer}>
      {render ? (
        <>
          <QRCode
            data={qrAddress ?? address}
            style={styles.qrCode}
            logo={blankAreaForLogo}
            pieceSize={pieceSize}
            width={231}
          />
          <View style={styles.qrLogo}>{logo}</View>
        </>
      ) : (
        <View style={styles.emptyQrArea} />
      )}
      <NativeText style={styles.addressText}>{address}</NativeText>
    </View>
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

const steezyStyles = Steezy.create(({ colors }) => ({
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 48 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.buttonSecondaryBackground,
  },
}));

const whitepng =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE4AAABOAQMAAAC0ZLJeAAAAA1BMVEX///+nxBvIAAAAEElEQVQYGWMYBaNgFNAAAAADWgABYd4igAAAAABJRU5ErkJggg==';
const blankAreaForLogo = { width: 78, height: 78, href: whitepng, scale: 2.3 };
