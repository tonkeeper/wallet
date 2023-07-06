import React, { useMemo } from 'react';
import { ActionType, EventModel } from '$store/models';
import { ActionItemBaseProps } from '$shared/components/ActionItem/ActionItemBase/ActionItemBase.interface';
import TonWeb from 'tonweb';
import { useSelector } from 'react-redux';
import { walletSelector } from '$store/wallet';
import {
  compareAddresses,
  format as formatDate,
  fromNano,
  maskifyTonAddress,
} from '$utils';
import { useTranslator } from '$hooks/useTranslator';
import { formatCryptoCurrency } from '$utils/currency';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { TransactionItemNFT } from '$shared/components/ActionItem/TransactionItemNFT/TransactionItemNFT';
import { subscriptionsSelector } from '$store/subscriptions';
import { Action } from 'tonapi-sdk-js';
import { useHideableFormatter } from '$core/HideableAmount/useHideableFormatter';

export function usePrepareAction(
  rawAction: Action,
  event: EventModel,
): ActionItemBaseProps {
  const { address } = useSelector(walletSelector);
  const t = useTranslator();
  const { subscriptionsInfo } = useSelector(subscriptionsSelector);
  const format = useHideableFormatter();

  return useMemo(() => {
    const action = rawAction[ActionType[rawAction.type]];

    if (ActionType.Unknown === ActionType[rawAction.type] || !action) {
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

    let labelColor = isReceive ? 'accentPositive' : 'foregroundPrimary';
    let prefix = isReceive ? '+' : '−';

    let label;
    let type;
    let typeLabel;
    let bottomContent;
    if (ActionType.TonTransfer === ActionType[rawAction.type]) {
      const amount = TonWeb.utils.fromNano(Math.abs(action.amount).toString());
      label = format(amount.toString(), {
        prefix: `${prefix} `,
        currencySeparator: 'wide',
        currency: CryptoCurrencies.Ton.toLocaleUpperCase(),
      });
      type = isReceive ? 'receive' : 'sent';
      typeLabel = t(`transaction_type_${type}`);
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
      const amount = fromNano(action.amount, action.jetton?.decimals ?? 9);
      label = format(amount.toString(), {
        prefix: `${prefix} `,
        currencySeparator: 'wide',
        currency: action.jetton?.symbol,
      });
      type = isReceive ? 'receive' : 'sent';
      typeLabel = t(`transaction_type_${type}`);
    }

    if (
      [ActionType.Subscribe, ActionType.UnSubscribe].includes(ActionType[rawAction.type])
    ) {
      const isSubscription = ActionType.Subscribe === ActionType[rawAction.type];
      const isBeneficiary = compareAddresses(action.beneficiary.address, address.ton);
      const amount = fromNano(action.amount, Decimals[CryptoCurrencies.Ton] || 9);
      if (isBeneficiary) {
        // Current user is beneficiary of this subscription, display it correctly
        prefix = '+';
        labelColor = isSubscription ? 'accentPositive' : labelColor;
        typeLabel = isSubscription
          ? t('transaction_type_new_subscriber')
          : t('transaction_type_subscriber_lost');
      } else {
        typeLabel = isSubscription
          ? t('transaction_type_subscription')
          : t('transaction_type_unsubscription');
      }
      label = isSubscription ? prefix + ' ' + format(amount.toString()) : '-';
      type = isSubscription ? 'subscription' : 'unsubscription';
      currency = isSubscription
        ? formatCryptoCurrency(
            '',
            CryptoCurrencies.Ton,
            Decimals[CryptoCurrencies.Ton],
            undefined,
            true,
          ).trim()
        : '';
    }

    if (ActionType.AuctionBid === ActionType[rawAction.type]) {
      const amount = TonWeb.utils.fromNano(Math.abs(action.amount.value).toString());
      label = prefix + ' ' + format(amount.toString());
      typeLabel = t('transaction_type_bid');
      type = action.auctionType === 'DNS.tg' ? 'tg_dns' : 'sent';
      currency = formatCryptoCurrency(
        '',
        CryptoCurrencies.Ton,
        Decimals[CryptoCurrencies.Ton],
        undefined,
        true,
      ).trim();
    }

    if (ActionType.ContractDeploy === ActionType[rawAction.type]) {
      label = '-';
      if (compareAddresses(action.address, address.ton)) {
        typeLabel = t('transaction_type_wallet_initialized');
        type = 'wallet_initialized';
      } else {
        typeLabel = t('transaction_type_contract_deploy');
        type = 'contract_deploy';
      }
    }

    const actionProps: ActionItemBaseProps = {
      type,
      typeLabel,
      label,
      labelColor,
      bottomContent,
      infoRows: [],
      comment: (!event.isScam && action.comment) || '',
      isInProgress: event.inProgress,
      isSpam: event.isScam,
    };

    const transactionDate = new Date(event.timestamp * 1000);
    let formattedDate = formatDate(transactionDate, 'HH:mm');

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
    } else if (ActionType.ContractDeploy === ActionType[rawAction.type]) {
      actionProps.infoRows.push({
        label: maskifyTonAddress(
          new TonWeb.Address(action.address).toString(true, true, true),
        ),
        value: formattedDate,
      });
    } else if (ActionType.AuctionBid === ActionType[rawAction.type]) {
      actionProps.infoRows.push({
        label:
          action.auctionType === 'DNS.tg' ? action.nft.metadata.name : action.nft.dns,
        value: formattedDate,
      });
    }

    if (rawAction.status === 'failed') {
      actionProps.bottomContent = null;
      actionProps.type = 'failed';
    }

    return actionProps;
  }, [
    rawAction,
    address.ton,
    event.isScam,
    event.inProgress,
    event.timestamp,
    format,
    t,
    subscriptionsInfo,
  ]) as ActionItemBaseProps;
}
