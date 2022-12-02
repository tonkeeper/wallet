import React, { useMemo } from 'react';
import { EventModel } from '$store/models';
import { ActionItemBaseProps } from '$shared/components/ActionItem/ActionItemBase/ActionItemBase.interface';
import TonWeb from 'tonweb';
import { useSelector } from 'react-redux';
import { walletSelector } from '$store/wallet';
import {
  compareAddresses,
  format,
  fromNano,
  maskifyTonAddress,
  truncateDecimal,
} from '$utils';
import { useTranslator } from '$hooks/useTranslator';
import { formatCryptoCurrency } from '$utils/currency';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { TransactionItemNFT } from '$shared/components/ActionItem/TransactionItemNFT/TransactionItemNFT';
import { subscriptionsSelector } from '$store/subscriptions';
import { dnsToUsername } from '$utils/dnsToUsername';
import { ActionTypeEnum } from 'tonapi-sdk-js';

export function usePrepareAction(
  rawAction: any, // TODO
  event: EventModel,
): ActionItemBaseProps {
  const { address } = useSelector(walletSelector);
  const t = useTranslator();
  const { subscriptionsInfo } = useSelector(subscriptionsSelector);

  return useMemo(() => {
    const action = rawAction[rawAction.type];

    if (ActionTypeEnum.Unknown === rawAction.type) {
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

    if (!Object.values(ActionTypeEnum).includes(rawAction.type)) {
      if (rawAction.simple_preview) {
        return {
          type: 'Unknown',
          typeLabel: rawAction.simple_preview.name,
          infoRows: [{ label: rawAction.simple_preview.short_description }],
        };
      } else {
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
    let currency;
    let bottomContent;
    if (ActionTypeEnum.TonTransfer === rawAction.type) {
      const amount = TonWeb.utils.fromNano(Math.abs(action.amount).toString());
      label = prefix + ' ' + truncateDecimal(amount.toString(), 2);
      type = isReceive ? 'receive' : 'sent';
      typeLabel = t(`transaction_type_${type}`);
      currency = formatCryptoCurrency(
        '',
        CryptoCurrencies.Ton,
        Decimals[CryptoCurrencies.Ton],
      ).trim();
    }

    if (ActionTypeEnum.NftItemTransfer === rawAction.type) {
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

    if (ActionTypeEnum.JettonTransfer === rawAction.type) {
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

    if ([ActionTypeEnum.Subscribe, ActionTypeEnum.UnSubscribe].includes(rawAction.type)) {
      const isSubscription = ActionTypeEnum.Subscribe === rawAction.type;
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
      label = isSubscription ? prefix + ' ' + truncateDecimal(amount.toString(), 2) : '-';
      type = isSubscription ? 'subscription' : 'unsubscription';
      currency = isSubscription
        ? formatCryptoCurrency(
            '',
            CryptoCurrencies.Ton,
            Decimals[CryptoCurrencies.Ton],
          ).trim()
        : '';
    }

    if (ActionTypeEnum.AuctionBid === rawAction.type && action.auctionType === 'DNS.tg') {
      const amount = TonWeb.utils.fromNano(Math.abs(action.amount.value).toString());
      label = prefix + ' ' + truncateDecimal(amount.toString(), 2);
      typeLabel = t('transaction_type_bid');
      type = 'tg_dns';
      currency = formatCryptoCurrency(
        '',
        CryptoCurrencies.Ton,
        Decimals[CryptoCurrencies.Ton],
      ).trim();
    }

    if (ActionTypeEnum.ContractDeploy === rawAction.type) {
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
      currency,
      labelColor,
      bottomContent,
      infoRows: [],
      comment: (!event.is_scam && action.comment) || '',
      isInProgress: event.in_progress,
      isSpam: event.is_scam,
    };

    const transactionDate = new Date(event.timestamp * 1000);
    let formattedDate = format(transactionDate, 'HH:mm');

    const accountToDisplay = isReceive ? action.sender : action.recipient;
    if ([ActionTypeEnum.Subscribe, ActionTypeEnum.UnSubscribe].includes(rawAction.type)) {
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
    } else if (ActionTypeEnum.ContractDeploy === rawAction.type) {
      actionProps.infoRows.push({
        label: maskifyTonAddress(
          new TonWeb.Address(action.address).toString(true, true, true),
        ),
        value: formattedDate,
      });
    } else if (
      ActionTypeEnum.AuctionBid === rawAction.type &&
      action.auctionType === 'DNS.tg'
    ) {
      actionProps.infoRows.push({
        label: dnsToUsername(action.nft.dns),
        value: formattedDate,
      });
    }

    return actionProps;
  }, [
    rawAction,
    address.ton,
    event.is_scam,
    event.in_progress,
    event.timestamp,
    t,
    subscriptionsInfo,
  ]) as ActionItemBaseProps;
}
