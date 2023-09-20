import { ReceiveTokenContent } from '../components/ReceiveTokenContent';
import { Modal, Picture, Steezy } from '@tonkeeper/uikit';
import { navigation } from '@tonkeeper/router';
import { memo, useMemo } from 'react';
import { t } from '../i18n';

import { jettonsSelector } from '@tonkeeper/mobile/src/store/jettons';
import { useWallet } from '../hooks/useWallet';
import { useSelector } from 'react-redux';
import { Address } from '../Address';

interface ReceiveJettonModalProps {
  jettonAddress: string;
}

export const ReceiveJettonModal = memo<ReceiveJettonModalProps>((props) => {
  const { jettonAddress } = props;
  const tonAddress = useWallet((state) => state.addresses.ton)!;
  const friendlyAddress = Address.parse(tonAddress).toFriendly();

  // TODO: Replace with new jetton manager
  const { jettonBalances } = useSelector(jettonsSelector);
  const jetton = useMemo(() => {
    return jettonBalances.find((item) => item.jettonAddress === jettonAddress)!;
  }, []);

  const link = useMemo(() => {
    return `ton://transfer/${friendlyAddress}?jetton=${jettonAddress}`;
  }, [jettonAddress]);

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content>
        <ReceiveTokenContent
          logo={<Picture uri={jetton?.metadata?.image} style={styles.jettonPicture} />}
          qrAddress={link}
          address={friendlyAddress}
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
