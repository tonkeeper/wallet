import {
  TransitionOpacity,
  SegmentedControl,
  TonIcon,
  Modal,
  Button,
  Pressable,
  Icon,
  Spacer,
  Steezy,
  copyText,
} from '@tonkeeper/uikit';
import { ReceiveTokenContent } from '../components/ReceiveTokenContent';
import { memo, useCallback, useMemo, useState } from 'react';
import { Share, StyleSheet } from 'react-native';
import { tk } from '../tonkeeper';
import { t } from '../i18n';
import { useParams } from '@tonkeeper/router/src/imperative';
import { AmountFormatter } from '@tonkeeper/core';
import { throttle, useNavigation } from '@tonkeeper/router';

enum Segments {
  Ton = 0,
  Tron = 1,
}

export const ReceiveModal = memo(() => {
  const params = useParams<{ amount: string }>();

  if (params.amount) {
    return <ReceiveAmountModal amount={params.amount} />;
  } else {
    return <ReceiveTonModal />;
  }
});

const ReceiveTonModal = memo(() => {
  const [segmentIndex, setSegmentIndex] = useState(Segments.Ton);
  const nav = useNavigation();

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
          style={styles.transition.static}
          duration={0}
          delay={0}
          alwaysShown
        >
          <ReceiveTokenContent
            qrCodeScale={0.8}
            logo={<TonIcon size="small" />}
            qrAddress={address2url(tonAddress)}
            address={tonAddress}
            title={t('receiveModal.receive_title', { tokenName: 'Toncoin' })}
            description={t('receiveModal.receive_description', {
              tokenName: 'Toncoin TON',
            })}
          >
            <Pressable
              style={styles.shareButton}
              onPress={copyText(tonAddress, t('address_copied'))}
            >
              <Icon name="ic-copy-16" />
            </Pressable>
            <Spacer x={12} />
            <Pressable style={styles.shareButton} onPress={share(tonAddress)}>
              <Icon name="ic-share-16" />
            </Pressable>
            <Spacer x={12} />
            <Button
              leftContent={<Icon name="ic-tray-arrow-down-16" />}
              onPress={() => {
                nav.navigate('/request');
              }}
              color="secondary"
              title={'Request'}
              size="medium"
            />
          </ReceiveTokenContent>
        </TransitionOpacity>
      </Modal.Content>
    </Modal>
  );
});

const ReceiveAmountModal = memo(({ amount }: { amount: string }) => {
  const nav = useNavigation();
  const tonAddress = tk.wallet.address.ton.friendly;
  const fullLink = useMemo(() => {
    return (
      'https://app.tonkeeper.com/transfer/' +
      tonAddress +
      '?amount=' +
      AmountFormatter.toNano(amount)
    );
  }, []);

  const title = useMemo(() => {
    return (
      'app.tonkeeper.com/transfer/' +
      tonAddress +
      '?amount=' +
      AmountFormatter.toNano(amount)
    );
  }, []);

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
    <Modal>
      <Modal.Header
        rightContent={
          <Button
            title="Reset"
            size="header"
            color="secondary"
            onPress={() => nav.navigate('ReceiveModal')}
          />
        }
      />
      <Modal.Content>
        <ReceiveTokenContent
          qrCodeScale={0.8}
          logo={<TonIcon size="small" />}
          qrAddress={fullLink}
          address={title}
          title={`Request ${amount} TON`}
          description={
            'Copy and send the transfer link or show the QR code below to the sender.'
          }
        >
          <Button
            leftContent={<Icon name="ic-copy-16" />}
            onPress={copyText(fullLink, t('address_copied'))}
            color="secondary"
            title={t('receiveModal.copy')}
            size="medium"
          />
          <Spacer x={12} />
          <Pressable style={styles.shareButton} onPress={share(fullLink)}>
            <Icon name="ic-share-16" />
          </Pressable>
        </ReceiveTokenContent>
      </Modal.Content>
    </Modal>
  );
});

const styles = Steezy.create(({ colors }) => ({
  transition: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
