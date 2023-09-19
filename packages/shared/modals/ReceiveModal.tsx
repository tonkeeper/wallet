import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text as NativeText, Share } from 'react-native';
import QRCode from 'react-native-qrcode-styled';
import { throttle } from '@tonkeeper/router';
import { tk } from '../tonkeeper';
import { t } from '../i18n';
import {
  TransitionOpacity,
  SegmentedControl,
  TouchableOpacity,
  Pressable,
  copyText,
  TonIcon,
  Steezy,
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
          <ReceiveContent
            logo={<TonIcon size="small" />}
            qrAddress={address2url(tonAddress)}
            address={tonAddress}
            title={t('receiveModal.receive_title', { tokenName: 'Toncoin' })}
            description={t('receiveModal.receive_description', {
              tokenName: 'Toncoin TON',
            })}
          />
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
  title: string;
  description: string;
}

const ReceiveContent = memo<QrCodeProps>((props) => {
  const { address, renderDelay = 0, logo, qrAddress, description, title } = props;
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
            <View style={{ transform: [{ scale: 0.8 }] }}>
              <QRCode
                data={qrAddress ?? address}
                logo={blankAreaForLogo}
                style={styles.qrCode}
                pieceSize={8}
              />
            </View>
            <View style={styles.qrLogo}>{logo}</View>
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
  qrLogo: {
    position: 'absolute',
    zIndex: 1,
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
const blankAreaForLogo = { width: 78, height: 78, href: whitepng, scale: 3.2 };
