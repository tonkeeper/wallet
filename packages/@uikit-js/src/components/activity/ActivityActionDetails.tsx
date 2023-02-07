import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import { Address } from 'ton-core';
import { ListBlock, ListItem, ListItemPayload } from '../List';
import { useAppContext, useWalletContext } from '../../hooks/appContext';
import {
  formatDecimals,
  formatFiatCurrency,
  getStockPrice,
  useFormatCoinValue,
} from '../../hooks/balance';
import { useTranslation } from '../../hooks/translation';
import { useTonenpointStock } from '../../state/tonendpoint';
import { Body1, Label1 } from '../Text';
import { ActionData } from './ActivityNotification';
import {
  ActionBeneficiaryDetails,
  ActionDate,
  ActionDetailsBlock,
  ActionFeeDetails,
  ActionRecipientDetails,
  ActionSenderDetails,
  ActionTransactionDetails,
  ErrorActivityNotification,
  Label,
  Title,
  useBalanceValue,
} from './NotificationCommon';

const Amount = styled(Body1)`
  display: block;
  user-select: none;
  color: ${(props) => props.theme.textSecondary};
`;

export const TonTransferActionNotification: FC<ActionData> = ({
  action,
  timestamp,
  event,
}) => {
  console.log(action, event);

  const { t } = useTranslation();
  const wallet = useWalletContext();
  const { tonTransfer } = action;

  const format = useFormatCoinValue();
  const { fiat, tonendpoint } = useAppContext();
  const { data: stock } = useTonenpointStock(tonendpoint);

  const price = useBalanceValue(tonTransfer?.amount, stock, fiat);

  if (!tonTransfer) {
    return <ErrorActivityNotification event={event} />;
  }

  if (tonTransfer.recipient.address === wallet.active.rawAddress) {
    return (
      <ActionDetailsBlock event={event}>
        <div>
          <Title>+ {format(tonTransfer.amount)} TON</Title>
          {price && <Amount>≈ {price}</Amount>}
          <ActionDate kind="received" timestamp={timestamp} />
        </div>
        <ListBlock margin={false} fullWidth>
          <ActionSenderDetails sender={tonTransfer.sender} />
          <ActionTransactionDetails event={event} />
          <ActionFeeDetails fee={event.fee} stock={stock} fiat={fiat} />
          {tonTransfer.comment && (
            <ListItem>
              <ListItemPayload>
                <Label>{t('transaction_message')}</Label>
                <Label1>{tonTransfer.comment}</Label1>
              </ListItemPayload>
            </ListItem>
          )}
        </ListBlock>
      </ActionDetailsBlock>
    );
  }

  return (
    <ActionDetailsBlock event={event}>
      <div>
        <Title>- {format(tonTransfer.amount)} TON</Title>
        {price && <Amount>≈ {price}</Amount>}
        <ActionDate kind="send" timestamp={timestamp} />
      </div>
      <ListBlock margin={false} fullWidth>
        <ActionRecipientDetails recipient={tonTransfer.recipient} />
        <ActionTransactionDetails event={event} />
        <ActionFeeDetails fee={event.fee} stock={stock} fiat={fiat} />
        {tonTransfer.comment && (
          <ListItem>
            <ListItemPayload>
              <Label>{t('transaction_message')}</Label>
              <Label1>{tonTransfer.comment}</Label1>
            </ListItemPayload>
          </ListItem>
        )}
      </ListBlock>
    </ActionDetailsBlock>
  );
};

export const JettonTransferActionNotification: FC<ActionData> = ({
  action,
  timestamp,
  event,
}) => {
  console.log(action, event);

  const wallet = useWalletContext();
  const { jettonTransfer } = action;

  const format = useFormatCoinValue();
  const { fiat, tonendpoint } = useAppContext();
  const { data: stock } = useTonenpointStock(tonendpoint);

  const total = useMemo(() => {
    if (!stock || !jettonTransfer) return undefined;
    const price = getStockPrice(
      Address.parse(jettonTransfer.jetton.address).toString(),
      stock.today,
      fiat
    );
    if (price === null) return undefined;
    const amount = formatDecimals(
      price.multipliedBy(jettonTransfer.amount),
      jettonTransfer.jetton.decimals
    );
    return formatFiatCurrency(fiat, amount);
  }, [jettonTransfer?.jetton.address, stock, fiat]);

  if (!jettonTransfer) {
    return <ErrorActivityNotification event={event} />;
  }

  if (jettonTransfer.sender?.address === wallet.active.rawAddress) {
    return (
      <ActionDetailsBlock event={event}>
        <div>
          <Title>
            - {format(jettonTransfer.amount, jettonTransfer.jetton.decimals)}{' '}
            {jettonTransfer.jetton.symbol}
          </Title>
          {total && <Amount>≈ {total}</Amount>}
          <ActionDate kind="send" timestamp={timestamp} />
        </div>
        <ListBlock margin={false} fullWidth>
          {jettonTransfer.recipient && (
            <ActionRecipientDetails recipient={jettonTransfer.recipient} />
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
        <Title>
          + {format(jettonTransfer.amount, jettonTransfer.jetton.decimals)}{' '}
          {jettonTransfer.jetton.symbol}
        </Title>
        {total && <Amount>≈ {total}</Amount>}
        <ActionDate kind="received" timestamp={timestamp} />
      </div>
      <ListBlock margin={false} fullWidth>
        {jettonTransfer.sender && (
          <ActionSenderDetails sender={jettonTransfer.sender} />
        )}
        <ActionTransactionDetails event={event} />
        <ActionFeeDetails fee={event.fee} stock={stock} fiat={fiat} />
      </ListBlock>
    </ActionDetailsBlock>
  );
};

export const AuctionBidActionDetails: FC<ActionData> = ({
  action,
  timestamp,
  event,
}) => {
  const { t } = useTranslation();
  const { auctionBid } = action;

  const { fiat, tonendpoint } = useAppContext();
  const { data: stock } = useTonenpointStock(tonendpoint);

  const format = useFormatCoinValue();
  const price = useBalanceValue(auctionBid?.amount.value, stock, fiat);

  if (!auctionBid) {
    return <ErrorActivityNotification event={event} />;
  }

  return (
    <ActionDetailsBlock event={event}>
      <div>
        <Title>{t('Bid')}</Title>
        <Amount>
          {format(auctionBid.amount.value)} {auctionBid.amount.tokenName}
        </Amount>
        {price && <Amount>≈ {price}</Amount>}
        <ActionDate kind="send" timestamp={timestamp} />
      </div>
      <ListBlock margin={false} fullWidth>
        <ActionBeneficiaryDetails beneficiary={auctionBid.beneficiary} />
        <ActionTransactionDetails event={event} />
        <ActionFeeDetails fee={event.fee} stock={stock} fiat={fiat} />
      </ListBlock>
    </ActionDetailsBlock>
  );
};
