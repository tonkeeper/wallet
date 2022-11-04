import React from 'react';
import { Action, ActionTypeEnum } from 'tonapi-sdk-js';
import { TonTransferAction as TonTransferActionData, NftItemTransferAction as NftTransferActionData, AuctionBidAction } from 'tonapi-sdk-js';
import * as S from '../NFTOperations.styles';
import { Highlight, Separator, Text } from '$uikit';
import { copyText } from '$hooks/useCopyText';
import { Ton } from '$libs/Ton';
import { t } from '$translation';
import { ListHeader } from '$uikit';
import TonWeb from 'tonweb';
import { dnsToUsername } from '$utils/dnsToUsername';
import { useDownloadNFT } from '../useDownloadNFT';

interface Props {
  action: Action;
  totalFee?: string;
  countActions: number;
  params: any;
}

export const SignRawAction = React.memo<Props>((props) => {
  const { action, totalFee, params, countActions } = props;

  if (action.type === ActionTypeEnum.AuctionBid) {
    const data = action[ActionTypeEnum.AuctionBid];

    if (data.auction_type === 'DNS.tg') {
      return (
        <TgAuctionBidAction
          action={data}
          skipHeader={countActions === 1}
          totalFee={totalFee}
        />
      );
    }
  }
 
  if (action.type === ActionTypeEnum.NftItemTransfer) {
    const data = action[ActionTypeEnum.NftItemTransfer];

    return (
      <TgNftItemTransferAction 
        action={data}
        skipHeader={countActions === 1}
        totalFee={totalFee}
      />
    );
  }


  if (action.type === ActionTypeEnum.TonTransfer) {
    return (
      <TonTransferAction 
        action={action[ActionTypeEnum.TonTransfer]}
        skipHeader={countActions === 1}
        totalFee={totalFee}
      /> 
    );
  }

  if (action.type === ActionTypeEnum.Unknown) {
    const message = action[ActionTypeEnum.Unknown];

    return (
      <UnknownAction 
        action={{
          address: message ? message.address : '',
          amount: message ? message.amount : ''
        }}
        skipHeader={countActions === 1}
      /> 
    );
  } 

  return null;
});

interface TonTransferActionProps {
  action: TonTransferActionData;
  skipHeader?: boolean;
  totalFee?: string;
}

const TonTransferAction = React.memo<TonTransferActionProps>((props) => {
  const { action, skipHeader, totalFee } = props;
  const amount = Ton.formatAmount(action.amount);
  const address = Ton.formatAddress(
    action.recipient.address, 
    { cut: true }
  );

  return (
    <>
      {!skipHeader && (
        <ListHeader title={t('txActions.signRaw.types.tonTransfer')} />
      )}
      <S.Container>
        <S.Info>
          <Highlight onPress={() => copyText(amount)}>
            <S.InfoItem>
              <S.InfoItemLabel>{t('txActions.amount')}</S.InfoItemLabel>
              <S.InfoItemValue>
                <Text variant="body1">{amount}</Text>
              </S.InfoItemValue>
            </S.InfoItem>
          </Highlight>
          <Separator />
          <Highlight onPress={() => copyText(address)}>
            <S.InfoItem>
              <S.InfoItemLabel>{t('txActions.signRaw.recipient')}</S.InfoItemLabel>
              <S.InfoItemValueText>
                {address}
              </S.InfoItemValueText>
            </S.InfoItem>
          </Highlight>
          {Boolean(action.comment) && (
            <>
              <Separator />
              <Highlight onPress={() => copyText(address)}>
                <S.InfoItem>
                  <S.InfoItemLabel>{t('txActions.signRaw.comment')}</S.InfoItemLabel>
                  <S.InfoItemValueText>
                    {action.comment}
                  </S.InfoItemValueText>
                </S.InfoItem>
              </Highlight>
            </>
          )}
          {Boolean(totalFee) && (
            <>
              <Separator />
              <Highlight onPress={() => copyText(address)}>
                <S.InfoItem>
                  <S.InfoItemLabel>{t('txActions.fee')}</S.InfoItemLabel>
                  <S.InfoItemValueText>
                    {totalFee}
                  </S.InfoItemValueText>
                </S.InfoItem>
              </Highlight>
            </>
          )}
        </S.Info>
      </S.Container>
    </>
  );
});


interface TgNftItemTransferActionProps {
  action: NftTransferActionData;
  skipHeader?: boolean;
  totalFee?: string;
}
const TgNftItemTransferAction = React.memo<TgNftItemTransferActionProps>((props) => {
  const { action, totalFee } = props;
  const item = useDownloadNFT(action.nft);
  const address = action.recipient 
    ? Ton.formatAddress(
      action.recipient.address, 
      { cut: true }
    )
    : '';

  const caption = React.useMemo(() => {
    let text = '...';
    if (item.data?.metadata) {
      text = `${dnsToUsername(item.data.metadata.name)}`;
    }

    if (item.data?.collection) {
      text += ` · ${item.data.collection.name}`;
    }

    return item.data ? text : '...';
  }, [item.data]);

  return (
    <S.Container>
      <S.Center>
        <S.NFTItemPreview>
          <S.LocalImage source={require('$assets/tg-full-logo.png')}  />
        </S.NFTItemPreview>
        <S.Caption>{caption}</S.Caption>
        <S.Title>{t('transaction_transfer_name')}</S.Title>
      </S.Center>
      
      <S.Info>
        <Highlight onPress={() => copyText(address)}>
          <S.InfoItem>
            <S.InfoItemLabel>{t('txActions.signRaw.recipient')}</S.InfoItemLabel>
            <S.InfoItemValueText>{address}</S.InfoItemValueText>
          </S.InfoItem>
        </Highlight>        
        {Boolean(totalFee) && (
          <>
            <Separator />
            <Highlight onPress={() => copyText(totalFee)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_fee')}</S.InfoItemLabel>
                <S.InfoItemValueText>{totalFee}</S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
          </>
        )}
      </S.Info>
    </S.Container>
  );
});

interface TgAuctionBidActionProps {
  action: AuctionBidAction;
  skipHeader?: boolean;
  totalFee?: string;
}

const TgAuctionBidAction = React.memo<TgAuctionBidActionProps>((props) => {
  const { action, totalFee } = props;
  const amount = Ton.formatAmount(action.amount.value);

  return (
    <S.Container>
      <S.Center>
        <S.NFTItemPreview>
          <S.LocalImage source={require('$assets/tg-full-logo.png')}  />
        </S.NFTItemPreview>
        <S.Title>{t('transaction_confirm_bid')}</S.Title>
      </S.Center>
      
      <S.Info>
        {action.nft && (
          <>
            <Highlight onPress={() => copyText(action.nft?.dns)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('transaction_bid_dns')}</S.InfoItemLabel>
                <S.InfoItemValueText>{dnsToUsername(action.nft?.dns)}</S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
            <Separator />
            <Highlight onPress={() => copyText(action.nft?.collection?.name)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('transaction_bid_collection_name')}</S.InfoItemLabel>
                <S.InfoItemValueText>
                  {action.nft.collection?.name}
                </S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
            <Separator />
          </>
        )}
        
        <Highlight onPress={() => copyText(amount)}>
          <S.InfoItem>
            <S.InfoItemLabel>{t('transaction_your_bid')}</S.InfoItemLabel>
            <S.InfoItemValueText>
              {amount}
            </S.InfoItemValueText>
          </S.InfoItem>
        </Highlight>
        {Boolean(totalFee) && (
          <>
            <Separator />
            <Highlight onPress={() => copyText(totalFee)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('nft_fee')}</S.InfoItemLabel>
                <S.InfoItemValueText>{totalFee}</S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
          </>
        )}
      </S.Info>
    </S.Container>
  );
});

interface UnknownActionProps {
  skipHeader?: boolean;
  action: {
    address: string;
    amount: string;
  }
}

const UnknownAction = React.memo<UnknownActionProps>(({ action, skipHeader }) => {
  const address = Ton.formatAddress(action.address, { cut: true });
  const amount = Ton.formatAmount(action.amount);

  return (
    <>
      {!skipHeader && (
        <ListHeader title={t('txActions.signRaw.types.unknownTransaction')} />
      )}
      <S.Container>
        <S.Info>
          <Highlight onPress={() => copyText(amount)}>
            <S.InfoItem>
              <S.InfoItemLabel>{t('txActions.amount')}</S.InfoItemLabel>
              <S.InfoItemValue>
                <Text variant="body1">{amount}</Text>
              </S.InfoItemValue>
            </S.InfoItem>
          </Highlight>
          <Separator />
          <Highlight onPress={() => copyText(address)}>
            <S.InfoItem>
              <S.InfoItemLabel>{t('txActions.signRaw.recipient')}</S.InfoItemLabel>
              <S.InfoItemValueText>
                {address}
              </S.InfoItemValueText>
            </S.InfoItem>
          </Highlight>
        </S.Info>
      </S.Container>
    </>
  );
});