import React from 'react';
import { useCopyText, useInstance, useWallet } from '$hooks';
import {Highlight, Icon, Separator, Skeleton, Text} from '$uikit';
import { NFTOperationFooter, useNFTOperationState } from '../NFTOperationFooter';
import { useDownloadCollectionMeta } from '../useDownloadCollectionMeta';
import { NftTransferParams, TxRequestBody } from '../TXRequest.types';
import { useDownloadNFT } from '../useDownloadNFT';
import { useUnlockVault } from '../useUnlockVault';
import { NFTOperations } from '../NFTOperations';
import * as S from '../NFTOperations.styles';
import {debugLog, maskifyAddress, toLocaleNumber} from '$utils';
import { t } from '$translation';
import { CryptoCurrencies } from '$shared/constants';
import { useDispatch } from 'react-redux';
import {nftsActions} from "$store/nfts";
import { Modal } from '$libs/navigation';
import {CaptionWrap} from "../NFTOperations.styles";
import { dnsToUsername } from '$utils/dnsToUsername';

type NFTTransferModalProps = TxRequestBody<NftTransferParams>;

export const NFTTransferModal = ({ params, ...options }: NFTTransferModalProps) => {
  const { footerRef, onConfirm } = useNFTOperationState(options);
  const item = useDownloadNFT(params.nftItemAddress);
  const collectionMeta = useDownloadCollectionMeta();
  const copyText = useCopyText();
  const dispatch = useDispatch();

  const [isShownDetails, setIsShownDetails] = React.useState(false);
  const [fee, setFee] = React.useState('');

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
      .getCollectionAddressByItem(params.nftItemAddress)
      .then((address) => {
        collectionMeta.download(address);
      })
      .catch((err) => debugLog('[NFT getCollectionUriByItem]', err));

    operations
      .transfer(params)
      .then((operation) => operation.estimateFee())
      .then((fee) => setFee(fee))
      .catch((err) => debugLog('[nft estimate fee]:', err));
  }, []);

  const handleConfirm = onConfirm(async ({ startLoading }) => {
    const vault = await unlockVault();
    const privateKey = await vault.getTonPrivateKey();

    startLoading();

    const operation = await operations.transfer(params);
    const deploy = await operation.send(privateKey);

    const txCurrency = CryptoCurrencies.Ton;
    dispatch(
      nftsActions.removeFromBalances({
        nftKey: `${txCurrency}_${params.nftItemAddress}`,
      }),
    );
    console.log('DEPLOY', deploy);
  });

  const isTG = (item.data?.dns || item.data?.metadata?.name)?.endsWith('.t.me');
  const isDNS = !!item.data?.dns && !isTG;

  const caption = React.useMemo(() => {
    let text = '...';
    if (item.data?.metadata) {
      text = `${isTG ? dnsToUsername(item.data.dns) : (item.data.dns || item.data.metadata.name)}`;
    }

    if (collectionMeta.data) {
      text += ` · ${isDNS ? 'TON DNS' : collectionMeta.data.name}`;
    }

    return item.data ? text : '...';
  }, [item.data, collectionMeta.data, isDNS, isTG]);

  return (
    <Modal>
      <Modal.Header gradient />
      <Modal.ScrollView scrollEnabled={isShownDetails}>
        <S.Container>
          <S.Center>
            <S.NFTItemPreview>
              {isDNS ? <S.GlobeIcon /> : null}
              {!isDNS && <S.Image uri={item?.data?.metadata?.image} resize={512} />}
            </S.NFTItemPreview>
            <S.CaptionWrap>
              <S.Caption>{caption}</S.Caption>
              {item.data?.approved_by?.length ? (
                <Icon style={{ marginLeft: 4 }} name="ic-verification-secondary-16" />
              ) : null}
            </S.CaptionWrap>
            <S.Title>{t('nft_transfer_title')}</S.Title>
          </S.Center>
          <S.Info>
            <Highlight onPress={() => copyText(params.newOwnerAddress)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_transfer_recipient')}</S.InfoItemLabel>
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
                  {fee ? (
                    <Text variant="body1">{toLocaleNumber(fee)} TON</Text>
                  ) : (
                    <Skeleton.Line width={80} />
                  )}
                </S.InfoItemValue>
              </S.InfoItem>
            </Highlight>
          </S.Info>
          {isShownDetails && (
            <S.Details>
              <Highlight onPress={() => copyText(collectionMeta.data?.name)}>
                <S.DetailItem>
                  <S.DetailItemLabel>NFT collection ID</S.DetailItemLabel>
                  <S.DetailItemValueText>
                    {collectionMeta.data?.name ?? '...'}
                  </S.DetailItemValueText>
                </S.DetailItem>
              </Highlight>
              <Highlight onPress={() => copyText(params.nftItemAddress)}>
                <S.DetailItem>
                  <S.DetailItemLabel>NFT item ID</S.DetailItemLabel>
                  <S.DetailItemValueText>
                    {maskifyAddress(params.nftItemAddress, 8)}
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
          responseOptions={options?.response_options}
          ref={footerRef}
        />
      </Modal.Footer>
    </Modal>
  );
};
