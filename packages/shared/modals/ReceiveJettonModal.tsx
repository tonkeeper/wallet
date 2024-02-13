import { ReceiveTokenContent } from '../components/ReceiveTokenContent';
import { Modal, Picture, Steezy } from '@tonkeeper/uikit';
import { navigation } from '@tonkeeper/router';
import { memo, useMemo } from 'react';
import { t } from '../i18n';

import { tk } from '@tonkeeper/mobile/src/wallet';
import { useJettons } from '../hooks';
import { Address } from '../Address';

interface ReceiveJettonModalProps {
  jettonAddress: string;
}

export const ReceiveJettonModal = memo<ReceiveJettonModalProps>((props) => {
  const { jettonAddress } = props;

  const { jettonBalances } = useJettons();
  const jetton = useMemo(() => {
    return jettonBalances.find((item) =>
      Address.compare(item.jettonAddress, jettonAddress),
    )!;
  }, []);

  const link = useMemo(() => {
    return (
      'ton://transfer/' + tk.wallet.address.ton.friendly + '?jetton=' + jettonAddress
    );
  }, [jettonAddress]);

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content>
        <ReceiveTokenContent
          logo={<Picture uri={jetton?.metadata?.image} style={styles.jettonPicture} />}
          qrAddress={link}
          address={tk.wallet.address.ton.friendly}
          qrCodeScale={0.67}
          title={t('receiveModal.receive_title', { tokenName: jetton?.metadata?.symbol })}
          description={t('receiveModal.receive_description', {
            tokenName: jetton?.metadata?.symbol,
          })}
        />
      </Modal.Content>
    </Modal>
  );
});

export function openReceiveJettonModal(jettonAddress: string) {
  navigation.push('/receive/jetton/', { jettonAddress });
}

const styles = Steezy.create(() => ({
  jettonPicture: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
  },
}));
