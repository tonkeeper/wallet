import React from 'react';
import { useCopyText } from '$hooks/useCopyText';
import { useInstance } from '$hooks/useInstance';
import { useWallet } from '$hooks/useWallet';
import { Highlight, Icon, Skeleton, Text } from '$uikit';
import { toLocaleNumber } from '$utils';
import { debugLog } from '$utils/debugLog';
import { NFTOperationFooter, useNFTOperationState } from '../NFTOperationFooter';
import { NftSaleCancelParams, TxRequestBody } from '../TXRequest.types';
import { useDownloadNFT } from '../useDownloadNFT';
import { useUnlockVault } from '../useUnlockVault';
import { NFTOperations } from '../NFTOperations';
import * as S from '../NFTOperations.styles';
import { t } from '@tonkeeper/shared/i18n';
import { Modal } from '@tonkeeper/uikit';

type NFTSaleCancelModalProps = TxRequestBody<NftSaleCancelParams> & {
  redirectToActivity?: boolean;
};

export const NFTSaleCancelModal = ({
  params,
  redirectToActivity,
  ...options
}: NFTSaleCancelModalProps) => {
  const item = useDownloadNFT(params.nftItemAddress);
  const { footerRef, onConfirm } = useNFTOperationState(options);
  const [fee, setFee] = React.useState('');
  const copyText = useCopyText();

  const unlockVault = useUnlockVault();
  const wallet = useWallet();
  const operations = useInstance(() => {
    return new NFTOperations(wallet);
  });

  React.useEffect(() => {
    operations
      .saleCancel(params)
      .then((operation) => operation.estimateFee())
      .then((fee) => setFee(fee))
      .catch((err) => {
        setFee('0.02');
        debugLog('[nft estimate fee]:', err);
      });
  }, []);

  const handleConfirm = onConfirm(async ({ startLoading }) => {
    const vault = await unlockVault();
    const privateKey = await vault.getTonPrivateKey();

    startLoading();

    const operation = await operations.saleCancel(params);
    const deploy = await operation.send(privateKey);

    console.log('DEPLOY', deploy);
  });

  const isTG = (item.data?.dns || item.data?.metadata?.name)?.endsWith('.t.me');
  const isDNS = !!item.data?.dns && !isTG;

  const caption = React.useMemo(() => {
    let text = '...';
    if (item.data?.metadata) {
      text = `${item.data.dns || item.data.metadata.name}`;
    }

    if (item.data?.collection) {
      text += ` · ${isDNS ? 'TON DNS' : item.data.collection.name}`;
    }

    return item.data ? text : '...';
  }, [item.data]);

  return (
    <Modal>
      <Modal.Header gradient />
      <Modal.ScrollView scrollEnabled={false}>
        <S.Container>
          <S.Center>
            <S.NFTItemPreview>
              <S.Image uri={item?.data?.metadata?.image} resize={512} />
            </S.NFTItemPreview>
            <S.CaptionWrap>
              <S.Caption>{caption}</S.Caption>
              {item.data?.approved_by?.length ? (
                <Icon style={{ marginLeft: 4 }} name="ic-verification-secondary-16" />
              ) : null}
            </S.CaptionWrap>
            <S.Title>{t('nft_sale_cancel_title')}</S.Title>
          </S.Center>
          <S.Info>
            <Highlight onPress={() => copyText(toLocaleNumber(fee))}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_fee')}</S.InfoItemLabel>
                <S.InfoItemValue>
                  {fee ? (
                    <Text variant="body1">{toLocaleNumber(fee)} TON</Text>
                  ) : (
                    <Skeleton.Line width={80} />
                  )}
                </S.InfoItemValue>
              </S.InfoItem>
            </Highlight>
          </S.Info>
        </S.Container>
      </Modal.ScrollView>
      <Modal.Footer>
        <NFTOperationFooter
          onPressConfirm={handleConfirm}
          ref={footerRef}
          redirectToActivity={redirectToActivity}
        />
      </Modal.Footer>
    </Modal>
  );
};
