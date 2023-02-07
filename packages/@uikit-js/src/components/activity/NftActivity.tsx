import { Action, NftItemRepr } from '@tonkeeper/core-js/src/tonApi';
import { toShortAddress } from '@tonkeeper/core-js/src/utils/common';
import React, { FC } from 'react';
import styled from 'styled-components';
import { useAppContext, useWalletContext } from '../../hooks/appContext';
import { useTranslation } from '../../hooks/translation';
import { useTonenpointStock } from '../../state/tonendpoint';
import { useNftItemData } from '../../state/wallet';
import { ListBlock } from '../List';
import { Body1, Body2, Label1 } from '../Text';
import { ActivityIcon, ReceiveIcon, SentIcon } from './ActivityIcons';
import { ActionData } from './ActivityNotification';
import {
  AmountText,
  Description,
  ErrorAction,
  FirstLine,
  ListItemGrid,
  SecondaryText,
  SecondLine,
} from './CommonAction';
import {
  ActionDate,
  ActionDetailsBlock,
  ActionFeeDetails,
  ActionRecipientDetails,
  ActionSenderDetails,
  ActionTransactionDetails,
  ErrorActivityNotification,
  Title,
} from './NotificationCommon';

const NftBlock = styled.div`
  background: ${(props) => props.theme.backgroundContentTint};
  border-radius: ${(props) => props.theme.cornerSmall};
  overflow: hidden;
  display: inline-flex;
  cursor: pointer;
  max-width: 100%;
`;

const NftText = styled.div`
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  overflow: hidden;
`;

const Body = styled(Body2)`
  text-overflow: ellipsis;
  overflow: hidden;
`;
const BodySecondary = styled(Body2)`
  color: ${(props) => props.theme.textSecondary};
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Wrapper = styled.div`
  grid-column: 2 / 3;
  overflow: hidden;
`;

export const NftComment: FC<{
  address: string;
  openNft: (nft: NftItemRepr) => void;
}> = ({ address, openNft }) => {
  const { data } = useNftItemData(address);

  if (!data) return <></>;
  const preview = data.previews?.find((item) => item.resolution === '100x100');
  return (
    <Wrapper>
      <NftBlock
        onClick={(e) => {
          e.stopPropagation();
          if (data) {
            openNft(data);
          }
        }}
      >
        {preview && <img height="64" width="64" src={preview.url} />}
        <NftText>
          <Body>{data.dns ?? data.metadata.name}</Body>
          <BodySecondary>
            {data.collection?.name ?? data.metadata.description}
          </BodySecondary>
        </NftText>
      </NftBlock>
    </Wrapper>
  );
};

export const NftItemTransferAction: FC<{
  action: Action;
  date: string;
  openNft: (nft: NftItemRepr) => void;
}> = ({ action, date, openNft }) => {
  const { t } = useTranslation();
  const wallet = useWalletContext();
  const { nftItemTransfer } = action;
  if (!nftItemTransfer) {
    return <ErrorAction />;
  }

  if (nftItemTransfer.sender?.address === wallet.active.rawAddress) {
    return (
      <ListItemGrid>
        <ActivityIcon>
          <SentIcon />
        </ActivityIcon>
        <Description>
          <FirstLine>
            <Label1>{t('transaction_type_sent')}</Label1>
            <AmountText></AmountText>
            <AmountText>NFT</AmountText>
          </FirstLine>
          <SecondLine>
            <SecondaryText>
              {nftItemTransfer.recipient?.name ??
                toShortAddress(
                  nftItemTransfer.recipient?.address ?? nftItemTransfer.nft
                )}
            </SecondaryText>
            <SecondaryText>{date}</SecondaryText>
          </SecondLine>
        </Description>
        <NftComment address={nftItemTransfer.nft} openNft={openNft} />
      </ListItemGrid>
    );
  }

  return (
    <ListItemGrid>
      <ActivityIcon>
        <ReceiveIcon />
      </ActivityIcon>
      <Description>
        <FirstLine>
          <Label1>{t('transaction_type_receive')}</Label1>
          <AmountText></AmountText>
          <AmountText>NFT</AmountText>
        </FirstLine>
        <SecondLine>
          <SecondaryText>
            {nftItemTransfer.sender?.name ??
              toShortAddress(
                nftItemTransfer.sender?.address ?? nftItemTransfer.nft
              )}
          </SecondaryText>
          <SecondaryText>{date}</SecondaryText>
        </SecondLine>
      </Description>
      <NftComment address={nftItemTransfer.nft} openNft={openNft} />
    </ListItemGrid>
  );
};

const Amount = styled(Body1)`
  display: block;
  user-select: none;
  color: ${(props) => props.theme.textSecondary};
  margin-bottom: 4px;
`;

const Image = styled.img`
  width: 96px;
  width: 96px;
  margin-bottom: 20px;
  border-radius: ${(props) => props.theme.cornerMedium};
`;

export const NftItemTransferActionDetails: FC<ActionData> = ({
  action,
  timestamp,
  event,
}) => {
  console.log(action, event);

  const wallet = useWalletContext();
  const { nftItemTransfer } = action;

  const { fiat, tonendpoint } = useAppContext();
  const { data: stock } = useTonenpointStock(tonendpoint);
  const { data } = useNftItemData(nftItemTransfer?.nft);

  if (!nftItemTransfer) {
    return <ErrorActivityNotification event={event} />;
  }

  const preview = data?.previews?.find((item) => item.resolution === '100x100');

  if (nftItemTransfer.sender?.address === wallet.active.rawAddress) {
    return (
      <ActionDetailsBlock event={event}>
        <div>
          {preview && <Image src={preview.url} alt="NFT Preview" />}
          {data && (
            <>
              <Title>{data.dns ?? data.metadata.name}</Title>
              <Amount>
                {data.collection?.name ?? data.metadata.description}
              </Amount>
            </>
          )}
          <ActionDate kind="send" timestamp={timestamp} />
        </div>
        <ListBlock margin={false} fullWidth>
          {nftItemTransfer.recipient && (
            <ActionRecipientDetails recipient={nftItemTransfer.recipient} />
          )}
          <ActionTransactionDetails event={event} />
          <ActionFeeDetails fee={event.fee} stock={stock} fiat={fiat} />
        </ListBlock>
      </ActionDetailsBlock>
    );
  }

  return (
    <ActionDetailsBlock event={event}>
      <div>
        {preview && <Image src={preview.url} alt="NFT Preview" />}
        {data && (
          <>
            <Title>{data.dns ?? data.metadata.name}</Title>
            <Amount>
              {data.collection?.name ?? data.metadata.description}
            </Amount>
          </>
        )}
        <ActionDate kind="received" timestamp={timestamp} />
      </div>
      <ListBlock margin={false} fullWidth>
        {nftItemTransfer.sender && (
          <ActionSenderDetails sender={nftItemTransfer.sender} />
        )}
        <ActionTransactionDetails event={event} />
        <ActionFeeDetails fee={event.fee} stock={stock} fiat={fiat} />
      </ListBlock>
    </ActionDetailsBlock>
  );
};
