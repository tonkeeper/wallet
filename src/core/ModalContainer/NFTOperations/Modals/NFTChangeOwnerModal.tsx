import React from 'react';
import { useDownloadCollectionMeta } from '../useDownloadCollectionMeta';
import { useCopyText, useInstance, useWallet } from '$hooks';
import { Highlight, Separator, Skeleton, Text } from '$uikit';
import { NFTOperationFooter, useNFTOperationState } from '../NFTOperationFooter';
import { NftChangeOwnerParams, TxRequestBody } from '../TXRequest.types';
import { useUnlockVault } from '../useUnlockVault';
import { NFTOperations } from '../NFTOperations';
import * as S from '../NFTOperations.styles';
import {debugLog, maskifyAddress, toLocaleNumber} from '$utils';
import { t } from '$translation';
import { Modal } from '$libs/navigation';

type NFTChangeOwnerModalProps = TxRequestBody<NftChangeOwnerParams>;

export const NFTChangeOwnerModal = ({ params, ...options }: NFTChangeOwnerModalProps) => {
  const meta = useDownloadCollectionMeta(params.nftCollectionAddress);
  const { footerRef, onConfirm } = useNFTOperationState(options);
  const [isShownDetails, setIsShownDetails] = React.useState(false);
  const [fee, setFee] = React.useState('');
  const copyText = useCopyText();

  const wallet = useWallet();
  const unlockVault = useUnlockVault();
  const operations = useInstance(() => {
    return new NFTOperations(wallet);
  });

  const toggleDetails = React.useCallback(() => {
    setIsShownDetails(!isShownDetails);
  }, [isShownDetails]);

  React.useEffect(() => {
    operations
      .changeOwner(params)
      .then((operation) => operation.estimateFee())
      .then((fee) => setFee(fee))
      .catch((err) =>  {
        setFee('0.02');
        debugLog('[nft estimate fee]:', err)
      });
  }, []);

  const handleConfirm = onConfirm(async ({ startLoading }) => {
    const vault = await unlockVault();
    const privateKey = await vault.getTonPrivateKey();
    
    startLoading();

    const operation = await operations.changeOwner(params);
    await operation.send(privateKey);
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
            <S.Caption>{meta.data?.name ?? '...'}</S.Caption>
            <S.Title>{t('nft_change_owner_title')}</S.Title>
          </S.Center>
          <S.Info>
            <Highlight onPress={() => copyText(params.newOwnerAddress)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_new_owner_address')}</S.InfoItemLabel>
                <S.InfoItemValueText>
                  {maskifyAddress(params.newOwnerAddress, 6)}
                </S.InfoItemValueText>
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
          {isShownDetails && (
            <S.Details>
              <Highlight onPress={() => copyText(params.nftCollectionAddress)}>
                <S.DetailItem>
                  <S.DetailItemLabel>NFT collection ID</S.DetailItemLabel>
                  <S.DetailItemValueText>{maskifyAddress(params.nftCollectionAddress, 8)}</S.DetailItemValueText>
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
