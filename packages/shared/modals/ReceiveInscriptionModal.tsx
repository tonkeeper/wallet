import { ReceiveTokenContent } from '../components/ReceiveTokenContent';
import { Modal, Steezy } from '@tonkeeper/uikit';
import { navigation } from '@tonkeeper/router';
import { memo, useMemo } from 'react';
import { t } from '../i18n';

import { tk } from '@tonkeeper/mobile/src/wallet';
import { useTonInscription } from '../query/hooks/useTonInscription';
import { AppStackRouteNames } from '@tonkeeper/mobile/src/navigation';

interface ReceiveInscriptionModalProps {
  type: string;
  ticker: string;
}

export const ReceiveInscriptionModal = memo<ReceiveInscriptionModalProps>((props) => {
  const inscription = useTonInscription(props);

  const link = useMemo(() => {
    let url = new URL(`ton://inscription-transfer/${tk.wallet.address.ton.friendly}`);

    url.searchParams.append('type', props.type);
    url.searchParams.append('ticker', props.ticker);

    return url.toString();
  }, [props.ticker, props.type]);

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content>
        <ReceiveTokenContent
          qrAddress={link}
          address={tk.wallet.address.ton.friendly}
          qrCodeScale={0.67}
          title={t('receiveModal.receive_title', { tokenName: props.ticker })}
          description={t('receiveModal.receive_description', {
            tokenName: props.ticker,
          })}
        />
      </Modal.Content>
    </Modal>
  );
});

export function openReceiveInscriptionModal(params: ReceiveInscriptionModalProps) {
  navigation.push(AppStackRouteNames.ReceiveInscription, params);
}

const styles = Steezy.create(() => ({
  jettonPicture: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
  },
}));
