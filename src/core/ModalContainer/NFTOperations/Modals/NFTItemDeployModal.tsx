import React from 'react';
import { useDownloadCollectionMeta } from '../useDownloadCollectionMeta';
import { useDownloadMetaFromUri } from '../useDownloadMetaFromUri';
import { useCopyText, useInstance, useWallet } from '$hooks';
import { Highlight, Separator, Skeleton, Text } from '$uikit';
import { NFTOperationFooter, useNFTOperationState } from '../NFTOperationFooter';
import { NftItemDeployParams, TxRequestBody } from '../TXRequest.types';
import { NFTItemMeta } from '../useDownloadNFT';
import { useUnlockVault } from '../useUnlockVault';
import { NFTOperations } from '../NFTOperations';
import * as S from '../NFTOperations.styles';
import {debugLog, maskifyAddress, toLocaleNumber} from '$utils';
import { t } from '$translation';
import { Modal } from '$libs/navigation';

type NFTItemDeployModalProps = TxRequestBody<NftItemDeployParams>;

export const NFTItemDeployModal = ({ params, ...options }: NFTItemDeployModalProps) => {
  const itemMeta = useDownloadMetaFromUri<NFTItemMeta>(
    params.nftItemContentBaseUri + params.itemContentUri,
  );
  const collectionMeta = useDownloadCollectionMeta(params.nftCollectionAddress);
  const { footerRef, onConfirm } = useNFTOperationState(options);
  const [isShownDetails, setIsShownDetails] = React.useState(false);
  const [fee, setFee] = React.useState('~');
  const copyText = useCopyText();

  const unlockVault = useUnlockVault();
  const wallet = useWallet();
  const operations = useInstance(() => {
    return new NFTOperations(wallet);
  });
  
  const toggleDetails = React.useCallback(() => {
    setIsShownDetails(!isShownDetails);
  }, [isShownDetails]);

  React.useEffect(() => {
    operations
      .deployItem(params)
      .then((operation) => operation.estimateFee())
      .then((fee) => setFee(fee))
      .catch((err) => {
        setFee('0.02');
        debugLog('[nft estimate fee]:', err)
      });
  }, []);
  const handleConfirm = onConfirm(async ({ startLoading }) => {
    const vault = await unlockVault();
    const privateKey = await vault.getTonPrivateKey();
    
    startLoading();

    const operation = await operations.deployItem(params);
    const deploy = await operation.send(privateKey);

    console.log('DEPLOY', deploy);
  });

  return (
    <Modal>
      <Modal.Header gradient />
      <Modal.ScrollView scrollEnabled={isShownDetails}>
        <S.Container>
          <S.Center>
            <S.NFTItemPreview>
              {itemMeta.data?.image && <S.Image uri={itemMeta.data.image} resize={512} />}
            </S.NFTItemPreview>
            <S.Title>{t('nft_item_deploy_title')}</S.Title>
          </S.Center>
          <S.Info>
            <Highlight onPress={() => copyText(itemMeta.data?.name)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_item_name')}</S.InfoItemLabel>
                <S.InfoItemValueText>{itemMeta.data?.name ?? '...'}</S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
            <Separator />
            <Highlight onPress={() => copyText(collectionMeta.data?.name)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_collection')}</S.InfoItemLabel>
                <S.InfoItemValueText>
                  {collectionMeta.data?.name ?? '...'}
                </S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
            <Separator />
            <Highlight onPress={() => copyText(toLocaleNumber(fee))}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_fee')}</S.InfoItemLabel>
                <S.InfoItemValueText>{toLocaleNumber(fee)} TON</S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
          </S.Info>
          {isShownDetails && (
            <S.Details>
              <Highlight onPress={() => copyText(String(params.itemIndex))}>
                <S.DetailItem>
                  <S.DetailItemLabel>Item index</S.DetailItemLabel>
                  <S.DetailItemValueText>{params.itemIndex}</S.DetailItemValueText>
                </S.DetailItem>
              </Highlight>
              <Highlight onPress={() => copyText(params.nftCollectionAddress)}>
                <S.DetailItem>
                  <S.DetailItemLabel>NFT collection ID</S.DetailItemLabel>
                  <S.DetailItemValueText>
                    {maskifyAddress(params.nftCollectionAddress, 8)}
                  </S.DetailItemValueText>
                </S.DetailItem>
              </Highlight>
              <Highlight onPress={() => copyText(params.itemContentUri)}>
                <S.DetailItem>
                  <S.DetailItemLabel>NFT item code HEX</S.DetailItemLabel>
                  <S.DetailItemValueText>{params.itemContentUri}</S.DetailItemValueText>
                </S.DetailItem>
              </Highlight>
            </S.Details>
          )}
          <S.Center>
            <S.ToggleDetailsButton onPress={toggleDetails}>
              <S.ToggleDetailsButtonTitle>
                {isShownDetails ? t('nft_hide_details') : t('nft_show_details')}
              </S.ToggleDetailsButtonTitle>
            </S.ToggleDetailsButton>
          </S.Center>
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
};
