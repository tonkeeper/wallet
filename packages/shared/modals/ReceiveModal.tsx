import { TransitionOpacity, SegmentedControl, TonIcon, Modal } from '@tonkeeper/uikit';
import { ReceiveTokenContent } from '../components/ReceiveTokenContent';
import { memo, useCallback, useMemo, useState } from 'react';
import { useNewWallet } from '../hooks/useWallet';
import { StyleSheet } from 'react-native';
import { t } from '../i18n';

enum Segments {
  Ton = 0,
  Tron = 1,
}

export const ReceiveModal = memo(() => {
  const [segmentIndex, setSegmentIndex] = useState(Segments.Ton);
  const wallet = useNewWallet();

  const tonAddress = wallet.ton.address.friendly;
  const tronAddress = undefined; //wallet.tron.tron?.proxy;

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
          <ReceiveTokenContent
            qrCodeScale={0.8}
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

const styles = StyleSheet.create({
  transition: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
