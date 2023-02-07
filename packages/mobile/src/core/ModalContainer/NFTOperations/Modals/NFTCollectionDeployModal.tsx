import React from 'react';
import { NFTCollectionMeta } from '../useDownloadCollectionMeta';
import { useDownloadMetaFromUri } from '../useDownloadMetaFromUri';
import { useCopyText, useInstance, useWallet } from '$hooks';
import { Highlight, Separator, Skeleton, Text } from '$uikit';
import { NFTOperationFooter, useNFTOperationState } from '../NFTOperationFooter';
import { NftCollectionDeployParams, TxRequestBody } from '../TXRequest.types';
import { useUnlockVault } from '../useUnlockVault';
import { NFTOperations } from '../NFTOperations';
import * as S from '../NFTOperations.styles';
import {debugLog, maskifyAddress, toLocaleNumber} from '$utils';
import { t } from '$translation';
import { Modal } from '$libs/navigation';

type NFTCollectionDeployModalProps = TxRequestBody<NftCollectionDeployParams>;

export const NFTCollectionDeployModal = ({ params, ...options }: NFTCollectionDeployModalProps) => {
  const meta = useDownloadMetaFromUri<NFTCollectionMeta>(params.collectionContentUri);
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
      .deployCollection(params)
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

    const operation = await operations.deployCollection(params);
    const deploy = await operation.send(privateKey);

    console.log('DEPLOY', deploy);
  });

  return (
    <Modal>
      <Modal.Header gradient />
      <Modal.ScrollView scrollEnabled={isShownDetails}>
        <S.Container>
          <S.Center>
            <S.NFTCollectionPreview>
              {meta.data?.image && (
                <S.Image 
                  uri={meta.data.image} 
                  resize={512}
                />
              )}
            </S.NFTCollectionPreview>
            <S.Title>{t('nft_deploy_collection_title')}</S.Title>
          </S.Center>
          <S.Info>
            <Highlight onPress={() => copyText(meta.data?.name)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_collection_name')}</S.InfoItemLabel>
                <S.InfoItemValueText>{meta.data?.name ?? '...'}</S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
            <Separator />
            <Highlight onPress={() => copyText(params.royaltyAddress)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_royalty_address')}</S.InfoItemLabel>
                <S.InfoItemValueText>
                  {maskifyAddress(params.royaltyAddress, 6)}
                </S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
            <Separator />
            <Highlight onPress={() => copyText(String(params.royalty * 100))}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_royalty')}</S.InfoItemLabel>
                <S.InfoItemValueText>{params.royalty * 100}%</S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
            <Separator />
            <Highlight onPress={() => copyText(toLocaleNumber(String(fee)))}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_fee')}</S.InfoItemLabel>
                <S.InfoItemValueText>{toLocaleNumber(fee)} TON</S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
          </S.Info>
          {isShownDetails && (
            <S.Details>
              <Highlight onPress={() => copyText(params.royaltyAddress)}>
                <S.DetailItem>
                  <S.DetailItemLabel>NFT collection ID</S.DetailItemLabel>
                  <S.DetailItemValueText>
                    {maskifyAddress(params.royaltyAddress, 8)}
                  </S.DetailItemValueText>
                </S.DetailItem>
              </Highlight>
              <Highlight onPress={() => copyText(params.collectionContentUri)}>
                <S.DetailItem>
                  <S.DetailItemLabel>Collection content URI</S.DetailItemLabel>
                  <S.DetailItemValueText>{params.collectionContentUri}</S.DetailItemValueText>
                </S.DetailItem>
              </Highlight>
              <Highlight onPress={() => copyText(params.nftItemContentBaseUri)}>
                <S.DetailItem>
                  <S.DetailItemLabel>NFT item content base URI</S.DetailItemLabel>
                  <S.DetailItemValueText>{params.nftItemContentBaseUri}</S.DetailItemValueText>
                </S.DetailItem>
              </Highlight>
              <Highlight onPress={() => copyText(params.nftItemCodeHex)}>
                <S.DetailItem>
                  <S.DetailItemLabel>NFT item code HEX</S.DetailItemLabel>
                  <S.DetailItemValueText>
                    {maskifyAddress(params.nftItemCodeHex, 8)}
                  </S.DetailItemValueText>
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
