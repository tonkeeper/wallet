import React, { useMemo } from 'react';
import { ActionType, EventModel } from '$store/models';
import TonWeb from 'tonweb';
import { useSelector } from 'react-redux';
import { walletSelector } from '$store/wallet';
import {
  compareAddresses,
  format as formatDate,
  fromNano,
  maskifyAddress,
  maskifyTonAddress,
} from '$utils';
import BigNumber from 'bignumber.js';
import { useTranslator } from '$hooks/useTranslator';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import {
  ActionBaseProps,
  InfoRows,
} from '$core/ModalContainer/Action/ActionBase/ActionBase.interface';
import { NFTHead } from '$core/ModalContainer/Action/ActionBase/NFTHead/NFTHead';
import { differenceInCalendarYears } from 'date-fns';
import { subscriptionsSelector } from '$store/subscriptions';
import { Action } from '@tonkeeper/core';
import { formatter } from '$utils/formatter';
import { Text } from '$uikit';
import { fiatCurrencySelector } from '$store/main';
import { useHideableFormatter } from '$core/HideableAmount/useHideableFormatter';
import { useGetTokenPrice, useTokenPrice } from './useTokenPrice';
import { useEncryptedCommentsStore } from '$store';
import { shallow } from 'zustand/shallow';

export function usePrepareDetailedAction(
  rawAction: Action,
  event: EventModel,
): ActionBaseProps {
  const { address } = useSelector(walletSelector);
  const t = useTranslator();
  const { subscriptionsInfo } = useSelector(subscriptionsSelector);
  const tokenPrice = useTokenPrice(CryptoCurrencies.Ton);
  const fiatCurrency = useSelector(fiatCurrencySelector);

  const format = useHideableFormatter();
  const getTokenPrice = useGetTokenPrice();

  const actionKey = event.eventId + rawAction.type;
  const decryptedComment: string | undefined = useEncryptedCommentsStore(
    (s) => s.decryptedComments[actionKey],
    shallow,
  );

  return useMemo(() => {
    const action = rawAction[ActionType[rawAction.type]];
    const isReceive =
      action.recipient &&
      new TonWeb.Address(action.recipient.address).toString(false, false, false) ===
        new TonWeb.Address(address.ton).toString(false, false, false);

    const prefix = isReceive ? '+' : '−';

    const isFailed = rawAction.status === 'failed';

    let label;
    let head;
    let shouldShowSendToRecipientButton = false;
    let shouldShowOpenSubscriptionButton = false;
    let subscriptionInfo;
    let jettonAddress;
    let recipientAddress;
    let infoRows: InfoRows = [];
    let sentLabelTranslationString = isReceive
      ? 'transaction_receive_date'
      : 'transaction_sent_date';
    let fiatValue: string | undefined;
    if (ActionType.TonTransfer === ActionType[rawAction.type]) {
      if (!isReceive) {
        shouldShowSendToRecipientButton = true;
        recipientAddress = new TonWeb.Address(action.recipient?.address).toString(
          true,
          true,
          true,
        );
      }
      const amount = TonWeb.utils.fromNano(new BigNumber(action.amount).abs().toString());
      label = format(amount, {
        prefix: `${prefix} `,
        withoutTruncate: true,
        decimals: Decimals[CryptoCurrencies.Ton],
        currency: CryptoCurrencies.Ton.toLocaleUpperCase(),
        currencySeparator: 'wide',
      });
      fiatValue = !isFailed
        ? format(tokenPrice.fiat * parseFloat(amount), {
            currency: fiatCurrency,
            currencySeparator: 'wide',
          })
        : undefined;
    }

    if (ActionType.NftItemTransfer === ActionType[rawAction.type]) {
      const NftAddress = new TonWeb.Address(action.nft).toString(true, true, true);
      head = (
        <NFTHead keyPair={{ currency: CryptoCurrencies.Ton, address: NftAddress }} />
      );
    }

    if (ActionType.JettonTransfer === ActionType[rawAction.type]) {
      if (!isReceive) {
        shouldShowSendToRecipientButton = true;
        recipientAddress = new TonWeb.Address(action.recipient?.address).toString(
          true,
          true,
          true,
        );
      }
      jettonAddress =
        action.jetton.address &&
        new TonWeb.Address(action.jetton.address).toString(true, true, true);
      const amount = fromNano(action.amount, action.jetton?.decimals ?? 9);
      label = format(amount, {
        prefix: `${prefix} `,
        withoutTruncate: true,
        decimals: action.jetton.decimals ?? 9,
        currency: action.jetton?.symbol || '',
        currencySeparator: 'wide',
      });
      const jettonPrice = getTokenPrice(jettonAddress, amount);
      fiatValue =
        !isFailed && jettonPrice.totalFiat
          ? formatter.format(jettonPrice.totalFiat, {
              currency: fiatCurrency,
              currencySeparator: 'wide',
            })
          : undefined;
    }

    if (ActionType.Subscribe === ActionType[rawAction.type]) {
      const amount = TonWeb.utils.fromNano(new BigNumber(action.amount).abs().toString());
      if (compareAddresses(action.beneficiary.address, address.ton)) {
        sentLabelTranslationString = 'transaction_receive_date';
        label = format(amount, {
          prefix: '+ ',
          withoutTruncate: true,
          decimals: Decimals[CryptoCurrencies.Ton],
          currency: CryptoCurrencies.Ton.toUpperCase(),
          currencySeparator: 'wide',
        });
      } else {
        sentLabelTranslationString = 'transaction_subscription_date';
        label = format(amount, {
          prefix: '- ',
          withoutTruncate: true,
          decimals: Decimals[CryptoCurrencies.Ton],
          currency: CryptoCurrencies.Ton.toUpperCase(),
          currencySeparator: 'wide',
        });
      }
      fiatValue = !isFailed
        ? format(tokenPrice.fiat * parseFloat(amount), {
            currency: fiatCurrency.toLocaleUpperCase(),
            currencySeparator: 'wide',
          })
        : undefined;
    }

    if (ActionType.UnSubscribe === ActionType[rawAction.type]) {
      sentLabelTranslationString = 'transaction_unsubscription_date';
      label = t('transaction_unsubscription');
    }

    if (ActionType.ContractDeploy === ActionType[rawAction.type]) {
      if (compareAddresses(action.address, address.ton)) {
        sentLabelTranslationString = 'transaction_contract_deploy_date';
        label = t('transaction_type_wallet_initialized');
      } else {
        sentLabelTranslationString = 'transaction_contract_deploy_date';
        label = t('transaction_type_contract_deploy');
      }
    }

    if (ActionType.AuctionBid === ActionType[rawAction.type]) {
      sentLabelTranslationString = 'transaction_bid_date';
      const amount = TonWeb.utils.fromNano(
        new BigNumber(action.amount.value).abs().toString(),
      );
      label = format(amount, {
        prefix: '- ',
        withoutTruncate: true,
        decimals: Decimals[CryptoCurrencies.Ton],
        currency: CryptoCurrencies.Ton.toUpperCase(),
        currencySeparator: 'wide',
      });

      infoRows.push({
        label: t('transaction_bid_dns'),
        value: action.nft.dns ?? action.nft.metadata?.name,
      });

      infoRows.push({
        label: t('transaction_bid_collection_name'),
        value: action.nft.collection.name,
      });
    }

    const accountToDisplay = isReceive ? action.sender : action.recipient;

    if (accountToDisplay?.name) {
      infoRows.push({
        label: isReceive ? t('transaction_sender') : t('transaction_recipient'),
        value: accountToDisplay?.name,
      });
    }

    if (accountToDisplay?.address) {
      const userFriendlyAddress = new TonWeb.Address(accountToDisplay.address).toString(
        true,
        true,
        true,
      );
      infoRows.push({
        label: isReceive
          ? t('transaction_sender_address')
          : t('transaction_recipient_address'),
        value: userFriendlyAddress,
        preparedValue: maskifyTonAddress(userFriendlyAddress),
      });
    }

    const info = subscriptionsInfo[action.subscription];
    if (info) {
      shouldShowOpenSubscriptionButton = true;
      subscriptionInfo = info;
      infoRows.push({
        label: t('transaction_merchant'),
        value: info.merchantName,
      });
      infoRows.push({
        label: t('transaction_subscription'),
        value: info.productName,
      });
    }

    if (!event.inProgress) {
      infoRows.push({
        label: t('transaction_hash'),
        value: event.eventId,
        preparedValue: maskifyAddress(event.eventId, 8),
      });
    }

    if (event.fee) {
      const amount = TonWeb.utils.fromNano(new BigNumber(event.fee.total).toString());
      infoRows.push({
        label: new BigNumber(event.fee.total).isLessThan(0)
          ? t('transaction_refund')
          : t('transaction_fee'),
        value: formatter
          .format(amount, {
            currencySeparator: 'wide',
            currency: CryptoCurrencies.Ton.toUpperCase(),
            absolute: true,
          })
          .trim(),
        subvalue: formatter.format(tokenPrice.fiat * parseFloat(amount), {
          currency: fiatCurrency,
          currencySeparator: 'wide',
        }),
      });
    }

    if (action.comment || action.encryptedComment) {
      infoRows.push({
        label: t('transaction_message'),
        preparedValue: action.comment,
        value: event.isScam
          ? t('transaction_copy_caution') + action.comment
          : action.comment,
      });
    }

    const actionProps: ActionBaseProps = {
      label,
      eventId: event.eventId,
      sentLabel: t(sentLabelTranslationString, {
        date: formatDate(
          event.timestamp * 1000,
          differenceInCalendarYears(event.timestamp, new Date()) === 0
            ? 'd MMM, HH:mm'
            : 'd MMM yyyy, HH:mm',
        ),
      }),
      isInProgress: event.inProgress,
      isSpam: event.isScam,
      isFailed: false,
      comment: action.comment,
      encryptedComment: event.isScam ? undefined : action.encryptedComment,
      decryptedComment: event.isScam ? undefined : decryptedComment,
      jettonAddress,
      recipientAddress,
      infoRows,
      head,
      shouldShowSendToRecipientButton,
      shouldShowOpenSubscriptionButton,
      subscriptionInfo,
      fiatValue,
    };

    if (isFailed) {
      actionProps.isFailed = true;
      actionProps.head = head && <Text variant="h2">NFT</Text>;
    }

    return actionProps;
  }, [
    rawAction,
    address.ton,
    subscriptionsInfo,
    event.inProgress,
    event.fee,
    event.eventId,
    event.timestamp,
    event.isScam,
    t,
    decryptedComment,
    format,
    tokenPrice.fiat,
    fiatCurrency,
    getTokenPrice,
  ]);
}
