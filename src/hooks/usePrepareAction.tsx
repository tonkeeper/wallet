import React, { useMemo } from 'react';
import { ActionType, EventModel } from '$store/models';
import { ActionItemBaseProps } from '$shared/components/ActionItem/ActionItemBase/ActionItemBase.interface';
import TonWeb from 'tonweb';
import { useSelector } from 'react-redux';
import { walletSelector } from '$store/wallet';
import { format, fromNano, maskifyTonAddress, truncateDecimal } from '$utils';
import BigNumber from 'bignumber.js';
import { useTranslator } from '$hooks/useTranslator';
import { formatCryptoCurrency } from '$utils/currency';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { TransactionItemNFT } from '$shared/components/ActionItem/TransactionItemNFT/TransactionItemNFT';
import { subscriptionsSelector } from '$store/subscriptions';
import { Action } from 'tonapi-sdk-js';

export function usePrepareAction(
  rawAction: Action,
  event: EventModel,
): ActionItemBaseProps {
  const { address } = useSelector(walletSelector);
  const t = useTranslator();
  const { subscriptionsInfo } = useSelector(subscriptionsSelector);

  return useMemo(() => {
    const action = rawAction[ActionType[rawAction.type]];

    if (ActionType.Unknown === ActionType[rawAction.type]) {
      return {
        type: 'Unknown',
        label: 'Unknown',
        typeLabel: 'Unknown',
        amount: 0,
        isInProgress: false,
        isSpam: false,
        infoRows: [],
        comment: '',
      };
    }

    const isReceive =
      action.recipient &&
      new TonWeb.Address(action.recipient.address).toString(false, false, false) ===
        new TonWeb.Address(address.ton).toString(false, false, false);

    const labelColor = isReceive ? 'accentPositive' : 'foregroundPrimary';

    const prefix = isReceive ? '+' : '−';

    let label;
    let type;
    let typeLabel;
    let currency;
    let bottomContent;
    if (ActionType.TonTransfer === ActionType[rawAction.type]) {
      const amount = TonWeb.utils.fromNano(new BigNumber(action.amount).abs().toString());
      label = prefix + ' ' + truncateDecimal(amount.toString(), 2);
      type = isReceive ? 'receive' : 'sent';
      typeLabel = t(`transaction_type_${type}`);
      currency = formatCryptoCurrency(
        '',
        CryptoCurrencies.Ton,
        Decimals[CryptoCurrencies.Ton],
      ).trim();
    }

    if (ActionType.NftItemTransfer === ActionType[rawAction.type]) {
      label = 'NFT';
      type = isReceive ? 'receive' : 'sent';
      typeLabel = t(`transaction_type_${type}`);
      const NftAddress = new TonWeb.Address(action.nft).toString(true, true, true);
      bottomContent = (
        <TransactionItemNFT
          keyPair={{ currency: CryptoCurrencies.Ton, address: NftAddress }}
        />
      );
    }

    if (ActionType.JettonTransfer === ActionType[rawAction.type]) {
      const amount = fromNano(action.amount, action.jetton?.decimal || 9);
      label = prefix + ' ' + truncateDecimal(amount.toString(), 2);
      type = isReceive ? 'receive' : 'sent';
      typeLabel = t(`transaction_type_${type}`);
      currency = formatCryptoCurrency(
        '',
        action.jetton?.symbol,
        Decimals[CryptoCurrencies.Ton],
      ).trim();
    }

    if (
      [ActionType.Subscribe, ActionType.UnSubscribe].includes(ActionType[rawAction.type])
    ) {
      const isSubscription = ActionType.Subscribe === ActionType[rawAction.type];
      const amount = fromNano(action.amount, Decimals[CryptoCurrencies.Ton] || 9);
      label = prefix + ' ' + truncateDecimal(amount.toString(), 2);
      type = isSubscription ? 'subscription' : 'unsubscription';
      typeLabel = isSubscription
        ? t('transaction_type_subscription')
        : t('transaction_type_unsubscription');
      currency = formatCryptoCurrency(
        '',
        CryptoCurrencies.Ton,
        Decimals[CryptoCurrencies.Ton],
      ).trim();
    }

    if (ActionType.ContractDeploy === ActionType[rawAction.type]) {
      label = t('transaction_type_contract_deploy');
    }

    const actionProps: ActionItemBaseProps = {
      type,
      typeLabel,
      label,
      currency,
      labelColor,
      bottomContent,
      infoRows: [],
      comment: (!event.isScam && action.comment) || '',
      isInProgress: event.inProgress,
      isSpam: event.isScam,
    };

    const transactionDate = new Date(event.timestamp * 1000);
    let formattedDate = format(transactionDate, 'HH:mm');

    const accountToDisplay = isReceive ? action.sender : action.recipient;
    if (
      [ActionType.Subscribe, ActionType.UnSubscribe].includes(ActionType[rawAction.type])
    ) {
      const info = subscriptionsInfo[action.subscription] || {};
      actionProps.infoRows.push({
        label: info.merchantName,
        value: formattedDate,
      });
      actionProps.infoRows.push({
        label: info.productName,
      });
    } else if (accountToDisplay) {
      actionProps.infoRows.push({
        label:
          accountToDisplay.name ||
          maskifyTonAddress(
            new TonWeb.Address(accountToDisplay.address).toString(true, true, true),
          ),
        value: formattedDate,
      });
    }

    return actionProps;
  }, [rawAction, address.ton, event.inProgress, event.isScam, event.timestamp, t, subscriptionsInfo]);
}
