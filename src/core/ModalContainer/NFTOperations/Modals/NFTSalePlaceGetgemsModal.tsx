import React from 'react';
import BigNumber from 'bignumber.js';
import { useCopyText, useInstance, useWallet } from '$hooks';
import {Highlight, Icon, Separator, Skeleton, Text} from '$uikit';
import { debugLog, delay, maskifyAddress, retry } from '$utils';
import { NFTOperationFooter, useNFTOperationState } from '../NFTOperationFooter';
import { NftSalePlaceGetgemsParams, TxRequestBody } from '../TXRequest.types';
import { useDownloadNFT } from '../useDownloadNFT';
import { useUnlockVault } from '../useUnlockVault';
import { NFTOperations } from '../NFTOperations';
import * as S from '../NFTOperations.styles';
import { t } from '$translation';
import { Ton } from '$libs/Ton';
import { Modal } from '$libs/navigation';

type NFTSalePlaceModalProps = TxRequestBody<NftSalePlaceGetgemsParams>;

export const NFTSalePlaceGetgemsModal = ({
  params,
  ...options
}: NFTSalePlaceModalProps) => {
  const item = useDownloadNFT(params.nftItemAddress);
  const { footerRef, onConfirm } = useNFTOperationState(options);
  const [isShownDetails, setIsShownDetails] = React.useState(false);
  const [txfee, setTxFee] = React.useState('');
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
      .salePlaceGetGems(params)
      .then((operation) => operation.estimateFee())
      .then((fee) => setTxFee(fee))
      .catch((err) => {
        setTxFee('0.02');
        debugLog('[nft estimate fee]:', err);
      });
  }, []);

  const transferToContract = React.useCallback(
    async (contractAddress: string, secretKey: Uint8Array) => {
      const info = await wallet!.ton.getWalletInfo(contractAddress);
      console.log(contractAddress);

      if (['empty', 'uninit'].includes(info.status)) {
        throw new Error('Contract uninitialized');
      }

      const operationTransfer = await operations.transfer(
        {
          newOwnerAddress: contractAddress,
          nftItemAddress: params.nftItemAddress,
          forwardAmount: params.forwardAmount,
          amount: params.transferAmount,
        },
        { useCurrentWallet: true },
      );

      const transfer = await operationTransfer.send(secretKey);

      console.log('transfer', transfer);
    },
    [],
  );

  const handleConfirm = onConfirm(async ({ startLoading }) => {
    const vault = await unlockVault();

    startLoading();

    const privateKey = await vault.getTonPrivateKey();
    const operation = await operations.salePlaceGetGems(params);
    const deploy = await operation.send(privateKey);
    console.log('deploy', deploy);

    const saleData = operation.getData();

    await delay(15 * 1000);
    const transfer = () => transferToContract(saleData.contractAddress, privateKey);
    retry(transfer, { attempt: 5, delay: 5 * 1000 }).catch((err) => {
      debugLog('[NFTSaleGetgems retry]', err);
    });
  });

  const fullPrice = React.useMemo(() => {
    return Ton.fromNano(params.fullPrice);
  }, []);

  const marketplaceFee = React.useMemo(() => {
    return Ton.fromNano(params.marketplaceFee);
  }, []);

  const royaltyAmount = React.useMemo(() => {
    return Ton.fromNano(params.royaltyAmount);
  }, []);

  const amount = React.useMemo(() => {
    const deployAmount = Ton.fromNano(params.deployAmount);
    const transferAmount = Ton.fromNano(params.transferAmount);

    return new BigNumber(deployAmount).plus(transferAmount).toString();
  }, []);

  const blockchainFee = React.useMemo(() => {
    if (txfee !== '') {
      return new BigNumber(txfee).plus(amount).toString();
    }

    return false;
  }, [txfee]);

  const feeAndRoyalties = React.useMemo(() => {
    if (txfee !== '') {
      return new BigNumber(txfee)
        .plus(amount)
        .plus(marketplaceFee)
        .plus(royaltyAmount)
        .toString();
    }

    return false;
  }, [txfee]);

  const proceeds = React.useMemo(() => {
    if (feeAndRoyalties) {
      return new BigNumber(fullPrice).minus(feeAndRoyalties).toString();
    }

    return false;
  }, [fullPrice, feeAndRoyalties]);

  const caption = React.useMemo(() => {
    let text = '...';
    if (item.data?.metadata) {
      text = `${item.data.dns || item.data.metadata.name}`;
    }

    if (item.data?.collection) {
      text += ` · ${item?.data?.dns ? 'TON DNS' : item.data.collection.name}`;
    }

    return item.data ? text : '...';
  }, [item.data]);

  return (
    <Modal>
      <Modal.Header gradient />
      <Modal.ScrollView scrollEnabled={isShownDetails}>
        <S.Container>
          <S.Center>
            <S.NFTItemPreview>
              {item.data?.dns ? <S.GlobeIcon /> : null}
              {!item.data?.dns && item.data?.metadata?.image && (
                <S.Image uri={item.data.metadata.image} resize={512} />
              )}
            </S.NFTItemPreview>
            <S.CaptionWrap>
              <S.Caption>{caption}</S.Caption>
              {item.data?.approved_by?.length ? (
                <Icon style={{ marginLeft: 4 }} name="ic-verification-secondary-16" />
              ) : null}
            </S.CaptionWrap>
            <S.Title>{t('nft_sale_place_title')}</S.Title>
          </S.Center>
          <S.Info>
            <Highlight onPress={() => copyText(params.marketplaceAddress)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_marketplace_address')}</S.InfoItemLabel>
                <S.InfoItemValueText>
                  {maskifyAddress(params.marketplaceAddress, 6)}
                </S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
            <Separator />
            <Highlight onPress={() => copyText(fullPrice)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_price')}</S.InfoItemLabel>
                <S.InfoItemValueText>{fullPrice} TON</S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
            <Separator />
            <Highlight onPress={() => copyText(proceeds)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_proceeds')}</S.InfoItemLabel>
                <S.InfoItemValue>
                  {proceeds ? (
                    <Text variant="body1">{proceeds} TON</Text>
                  ) : (
                    <Skeleton.Line width={80} />
                  )}
                </S.InfoItemValue>
              </S.InfoItem>
            </Highlight>
            <Separator />
            <Highlight onPress={() => copyText(feeAndRoyalties)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_fee_and_royalties')}</S.InfoItemLabel>
                <S.InfoItemValue>
                  {feeAndRoyalties ? (
                    <Text variant="body1">{feeAndRoyalties} TON</Text>
                  ) : (
                    <Skeleton.Line width={80} />
                  )}
                </S.InfoItemValue>
              </S.InfoItem>
            </Highlight>
          </S.Info>
          {isShownDetails && (
            <S.Details>
              <Highlight onPress={() => copyText(params.nftItemAddress)}>
                <S.DetailItem>
                  <S.DetailItemLabel>NFT item ID</S.DetailItemLabel>
                  <S.DetailItemValueText>
                    {maskifyAddress(params.nftItemAddress, 8)}
                  </S.DetailItemValueText>
                </S.DetailItem>
              </Highlight>
              <Highlight onPress={() => copyText(marketplaceFee)}>
                <S.DetailItem>
                  <S.DetailItemLabel>Marketplace fee</S.DetailItemLabel>
                  <S.DetailItemValueText>{marketplaceFee} TON</S.DetailItemValueText>
                </S.DetailItem>
              </Highlight>
              <Highlight onPress={() => copyText(params.royaltyAddress)}>
                <S.DetailItem>
                  <S.DetailItemLabel>Royalty address</S.DetailItemLabel>
                  <S.DetailItemValueText>
                    {maskifyAddress(params.royaltyAddress, 8)}
                  </S.DetailItemValueText>
                </S.DetailItem>
              </Highlight>
              <Highlight onPress={() => copyText(royaltyAmount)}>
                <S.DetailItem>
                  <S.DetailItemLabel>Royalty</S.DetailItemLabel>
                  {royaltyAmount ? (
                    <Text variant="body2">{royaltyAmount} TON</Text>
                  ) : (
                    <Skeleton.Line width={80} />
                  )}
                </S.DetailItem>
              </Highlight>
              <Highlight onPress={() => copyText(blockchainFee)}>
                <S.DetailItem>
                  <S.DetailItemLabel>Blockchain fee</S.DetailItemLabel>
                  {blockchainFee ? (
                    <Text variant="body2">{blockchainFee} TON</Text>
                  ) : (
                    <Skeleton.Line width={80} />
                  )}
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
