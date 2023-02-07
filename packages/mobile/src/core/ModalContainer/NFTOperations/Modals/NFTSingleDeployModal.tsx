import React from 'react';
import { useCopyText, useInstance, useWallet } from '$hooks';
import { Highlight, Separator, Skeleton, Text } from '$uikit';
import { NFTOperationFooter, useNFTOperationState } from '../NFTOperationFooter';
import { NftSingleDeployParams, TxRequestBody } from '../TXRequest.types';
import { useDownloadMetaFromUri } from '../useDownloadMetaFromUri';
import { NFTItemMeta } from '../useDownloadNFT';
import { useUnlockVault } from '../useUnlockVault';
import { NFTOperations } from '../NFTOperations';
import * as S from '../NFTOperations.styles';
import {debugLog, toLocaleNumber} from '$utils';
import { t } from '$translation';
import { Modal } from '$libs/navigation';

type NFTSingleDeployModal = TxRequestBody<NftSingleDeployParams>;

export const NFTSingleDeployModal = ({ params, ...options }: NFTSingleDeployModal) => {
  const itemMeta = useDownloadMetaFromUri<NFTItemMeta>(params.itemContentUri);
  const { footerRef, onConfirm } = useNFTOperationState(options);
  const [fee, setFee] = React.useState('');
  const copyText = useCopyText();

  const wallet = useWallet();
  const unlockVault = useUnlockVault();
  const operations = useInstance(() => {
    return new NFTOperations(wallet);
  });

  React.useEffect(() => {
    operations
      .deploy({
        stateInitHex: params.stateInitHex,
        address: params.contractAddress,
        amount: params.amount
      })
      .then((operation) => operation.estimateFee())
      .then((fee) => setFee(fee))
      .catch((err) => {
        setFee('0.02');
        debugLog('[nft estimate fee]:', err);
      });
  }, []);

  const handleConfirm = onConfirm(async ({ startLoading }) => {
    const vault = await unlockVault();
    
    startLoading();

    const privateKey = await vault.getTonPrivateKey();
    const operation = await operations.deploy({ 
      stateInitHex: params.stateInitHex,
      address: params.contractAddress,
      amount: params.amount
    });

    await operation.send(privateKey);
  });

  return (
    <Modal>
      <Modal.Header gradient />
      <Modal.ScrollView scrollEnabled={false}>
        <S.Container>
          <S.Center>
            <S.NFTItemPreview>
              {itemMeta.data?.image && (
                <S.Image 
                  uri={itemMeta.data?.image} 
                  resize={512}
                />
              )}
            </S.NFTItemPreview>
            <S.Title>{t('nft_item_deploy_title')}</S.Title>
          </S.Center>
          <S.Info>
            <Highlight onPress={() => copyText(itemMeta.data?.name)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_item_name')}</S.InfoItemLabel>
                <S.InfoItemValue>
                  {itemMeta.data?.name ? (
                    <Text variant="body1">
                      {itemMeta.data.name}
                    </Text>
                  ) : (
                    <Skeleton.Line width={144} />
                  )}
                </S.InfoItemValue>
              </S.InfoItem>
            </Highlight>
            <Separator />
            <Highlight onPress={() => fee && copyText(toLocaleNumber(fee))}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_fee')}</S.InfoItemLabel>
                <S.InfoItemValue>
                  {!!fee ? (
                    <Text variant="body1">
                      {toLocaleNumber(fee)} TON
                    </Text>
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
        />
      </Modal.Footer>
    </Modal>
  );
}
