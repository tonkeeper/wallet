import React from 'react';
import {
  Action,
  ActionTypeEnum,
  TonTransferAction as TonTransferActionData,
  NftItemTransferAction as NftTransferActionData,
  AuctionBidAction as SDKAuctionBidAction,
} from '@tonkeeper/core/src/legacy';
import * as S from '../NFTOperations.styles';
import { Highlight, Separator, Skeleton, Text } from '$uikit';
import { copyText } from '$hooks/useCopyText';
import { Ton } from '$libs/Ton';
import { t } from '@tonkeeper/shared/i18n';
import { ListHeader } from '$uikit';
import { dnsToUsername } from '$utils/dnsToUsername';
import { useDownloadNFT } from '../useDownloadNFT';
import { Address } from '@tonkeeper/shared/Address';
import { DNS, KnownTLDs } from '@tonkeeper/core';
import { getFlag } from '$utils/flags';

interface Props {
  action: Action;
  totalFee?: { fee: string; isNegative: boolean };
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
    } else {
      return (
        <AuctionBidAction
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
      <NftItemTransferAction
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
          amount: message ? message.amount : '',
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
  totalFee?: Props['totalFee'];
}

const TonTransferAction = React.memo<TonTransferActionProps>((props) => {
  const { action, skipHeader, totalFee } = props;
  const amount = Ton.formatAmount(action.amount);
  const address = Address.parse(action.recipient.address, {
    bounceable: !getFlag('address_style_nobounce'),
  }).toAll();

  return (
    <>
      {!skipHeader && <ListHeader title={t('txActions.signRaw.types.tonTransfer')} />}
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
          <Highlight onPress={() => copyText(address.friendly)}>
            <S.InfoItem>
              <S.InfoItemLabel>{t('txActions.signRaw.recipient')}</S.InfoItemLabel>
              <S.InfoItemValueText>{address.short}</S.InfoItemValueText>
            </S.InfoItem>
          </Highlight>
          {Boolean(action.comment) && (
            <>
              <Separator />
              <Highlight onPress={() => copyText(action.comment)}>
                <S.InfoItem>
                  <S.InfoItemLabel>{t('txActions.signRaw.comment')}</S.InfoItemLabel>
                  <S.InfoItemValueText>{action.comment}</S.InfoItemValueText>
                </S.InfoItem>
              </Highlight>
            </>
          )}
          {Boolean(totalFee) && (
            <>
              <Separator />
              <Highlight onPress={() => copyText(totalFee?.fee)}>
                <S.InfoItem>
                  <S.InfoItemLabel>
                    {totalFee?.isNegative ? t('txActions.refund') : t('txActions.fee')}
                  </S.InfoItemLabel>
                  <S.InfoItemValueText>{totalFee?.fee}</S.InfoItemValueText>
                </S.InfoItem>
              </Highlight>
            </>
          )}
        </S.Info>
      </S.Container>
    </>
  );
});

interface NftItemTransferActionProps {
  action: NftTransferActionData;
  skipHeader?: boolean;
  totalFee?: Props['totalFee'];
}
const NftItemTransferAction = React.memo<NftItemTransferActionProps>((props) => {
  const { action, totalFee } = props;
  const item = useDownloadNFT(action.nft);
  const address = action.recipient
    ? Address.parse(action.recipient.address, {
        bounceable: !getFlag('address_style_nobounce'),
      }).toAll()
    : {
        short: '',
        friendly: '',
      };

  const isTG = DNS.getTLD(item.data?.dns || item.data?.name) === KnownTLDs.TELEGRAM;

  const caption = React.useMemo(() => {
    let text = '...';
    if (item.data?.metadata) {
      text = `${item.data.metadata.name}`;
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
          <S.Image uri={item.data?.metadata?.image} resize={512} />
        </S.NFTItemPreview>
        <S.Caption>{caption}</S.Caption>
        {item.data ? (
          <S.Title>
            {t(isTG ? 'transaction_transfer_name' : 'nft_transfer_title')}
          </S.Title>
        ) : (
          <Skeleton.Line style={{ marginBottom: 24, marginTop: 8 }} width={140} />
        )}
      </S.Center>

      <S.Info>
        <Highlight onPress={() => address && copyText(address.friendly)}>
          <S.InfoItem>
            <S.InfoItemLabel>{t('txActions.signRaw.recipient')}</S.InfoItemLabel>
            <S.InfoItemValueText>{address.short}</S.InfoItemValueText>
          </S.InfoItem>
        </Highlight>
        {Boolean(totalFee) && (
          <>
            <Separator />
            <Highlight onPress={() => copyText(totalFee?.fee)}>
              <S.InfoItem>
                <S.InfoItemLabel>
                  {totalFee?.isNegative ? t('txActions.refund') : t('txActions.fee')}
                </S.InfoItemLabel>
                <S.InfoItemValueText>{totalFee?.fee}</S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
          </>
        )}
      </S.Info>
    </S.Container>
  );
});

interface TgAuctionBidActionProps {
  action: SDKAuctionBidAction;
  skipHeader?: boolean;
  totalFee?: Props['totalFee'];
}

const TgAuctionBidAction = React.memo<TgAuctionBidActionProps>((props) => {
  const { action, totalFee } = props;
  const amount = Ton.formatAmount(action.amount.value);

  return (
    <S.Container>
      <S.Center>
        <S.NFTItemPreview>
          <S.Image uri={action.nft?.metadata?.image} resize={512} />
        </S.NFTItemPreview>
        <S.Title>{t('transaction_confirm_bid')}</S.Title>
      </S.Center>

      <S.Info>
        {action.nft && (
          <>
            <Highlight onPress={() => copyText(action.nft?.dns)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('transaction_bid_dns')}</S.InfoItemLabel>
                <S.InfoItemValueText>
                  {dnsToUsername(action.nft?.dns)}
                </S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
            <Separator />
            <Highlight onPress={() => copyText(action.nft?.collection?.name)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('transaction_bid_collection_name')}</S.InfoItemLabel>
                <S.InfoItemValueText>{action.nft.collection?.name}</S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
            <Separator />
          </>
        )}

        <Highlight onPress={() => copyText(amount)}>
          <S.InfoItem>
            <S.InfoItemLabel>{t('transaction_your_bid')}</S.InfoItemLabel>
            <S.InfoItemValueText>{amount}</S.InfoItemValueText>
          </S.InfoItem>
        </Highlight>
        {Boolean(totalFee) && (
          <>
            <Separator />
            <Highlight onPress={() => copyText(totalFee?.fee)}>
              <S.InfoItem>
                <S.InfoItemLabel>
                  {totalFee?.isNegative ? t('txActions.refund') : t('txActions.fee')}
                </S.InfoItemLabel>
                <S.InfoItemValueText>{totalFee?.fee}</S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
          </>
        )}
      </S.Info>
    </S.Container>
  );
});

interface AuctionBidActionProps {
  action: SDKAuctionBidAction;
  skipHeader?: boolean;
  totalFee?: Props['totalFee'];
}

const AuctionBidAction = React.memo<AuctionBidActionProps>((props) => {
  const { action, totalFee } = props;
  const amount = Ton.formatAmount(action.amount.value);

  const caption = React.useMemo(() => {
    let text = '...';
    if (action.nft?.metadata) {
      text = `${action.nft.metadata.name}`;
    }

    if (action.nft?.collection) {
      text += ` · ${action.nft.collection.name}`;
    }

    return action.nft ? text : '...';
  }, [action.nft]);

  return (
    <S.Container>
      <S.Center>
        <S.NFTItemPreview>
          <S.Image uri={action.nft?.metadata?.image} resize={512} />
        </S.NFTItemPreview>
        <S.Caption>{caption}</S.Caption>
        <S.Title>{t('transaction_confirm_bid')}</S.Title>
      </S.Center>

      <S.Info>
        {action.nft && (
          <>
            <Separator />
            <Highlight onPress={() => copyText(action.nft?.collection?.name)}>
              <S.InfoItem>
                <S.InfoItemLabel>{t('transaction_bid_collection_name')}</S.InfoItemLabel>
                <S.InfoItemValueText>{action.nft.collection?.name}</S.InfoItemValueText>
              </S.InfoItem>
            </Highlight>
            <Separator />
          </>
        )}

        <Highlight onPress={() => copyText(amount)}>
          <S.InfoItem>
            <S.InfoItemLabel>{t('transaction_your_bid')}</S.InfoItemLabel>
            <S.InfoItemValueText>{amount}</S.InfoItemValueText>
          </S.InfoItem>
        </Highlight>
        {Boolean(totalFee) && (
          <>
            <Separator />
            <Highlight onPress={() => copyText(totalFee?.fee)}>
              <S.InfoItem>
                <S.InfoItemLabel>
                  {totalFee?.isNegative ? t('txActions.refund') : t('txActions.fee')}
                </S.InfoItemLabel>
                <S.InfoItemValueText>{totalFee?.fee}</S.InfoItemValueText>
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
  };
}

const UnknownAction = React.memo<UnknownActionProps>(({ action, skipHeader }) => {
  const address = Address.parse(action.address).toAll();
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
          <Highlight onPress={() => copyText(address.friendly)}>
            <S.InfoItem>
              <S.InfoItemLabel>{t('txActions.signRaw.recipient')}</S.InfoItemLabel>
              <S.InfoItemValueText>{address.short}</S.InfoItemValueText>
            </S.InfoItem>
          </Highlight>
        </S.Info>
      </S.Container>
    </>
  );
});
