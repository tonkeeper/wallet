import { t } from '$translation';
import { format, formatDate, getLocale } from '$utils';
import {
  EventActionType,
  MergedEventAction,
} from './Events.types';
import { differenceInCalendarMonths } from 'date-fns';
import { Address } from '@tonkeeper/core';
import { formatter } from '$utils/formatter';

import {
  ClientEvent,
  ClientEventAction,
  ClientEventType,
  GroupedActionsByDate,
} from '@tonkeeper/shared/components/TransactionList/DataTypes';
import { AccountEvent, AccountEvents, TonTransferAction } from '@tonkeeper/core/src/TonAPI/TonAPIGenerated';

const getSenderAccount = (isReceive: boolean, action: TonTransferAction) => {
  const senderAccount = isReceive ? action.sender : action.recipient;
  if (senderAccount) {
    if (senderAccount.name) {
      return senderAccount.name;
    }

    return Address(senderAccount.address).maskify();
  }

  return '';
};

function getGroupDate(timestamp: number) {
  const ts = timestamp * 1000;
  const now = new Date();

  if (differenceInCalendarMonths(now, new Date(ts)) < 1) {
    return format(new Date(ts), 'd MMMM', { locale: getLocale() });
  }

  return format(new Date(ts), 'LLLL');
}

export function EventsMapper(events: AccountEvent[], walletAddress: string) {
  const groupedActions = events.reduce<GroupedActionsByDate>((groups, event) => {
    const date = getGroupDate(event.timestamp);

    if (!groups[date]) {
      groups[date] = [];
    }

    const actions = EventMapper(event, walletAddress);
    groups[date].push(...actions);

    return groups;
  }, {});

  return Object.keys(groupedActions).reduce((acc, date) => {
    const actions = groupedActions[date];
    const txTime = actions[0].timestamp * 1000;
    const formattedDate = formatDate(new Date(txTime));

    acc.push({
      type: ClientEventType.Date,
      id: `date-${formattedDate}`,
      date: formattedDate,
    });

    acc.push(...actions);

    return acc;
  }, [] as ClientEvent[]);
}

export function EventMapper(event: AccountEvent, walletAddress: string) {
  const countAction = event.actions.length;
  const actions = event.actions.reduce((actions, serverAction, index) => {
    const actionData = serverAction[serverAction.type] as MergedEventAction;
    const action = EventsActionMapper({
      actionIndex: index,
      walletAddress,
      event,
      action: {
        data: actionData,
        ...serverAction,
      },
    });

    if (index === 0) {
      action.topCorner = true;
    }

    if (index === countAction - 1) {
      action.bottomCorner = true;
    }

    actions.push(action);

    return actions;
  }, [] as ClientEventAction[]);

  return actions;
}

type EventsActionMapperInput = {
  walletAddress: string;
  action: MergedEventAction;
  actionIndex: number;
  event: any;
};

export function EventsActionMapper(input: EventsActionMapperInput): ClientEventAction {
  const time = format(new Date(input.event.timestamp * 1000), 'HH:mm');
  const action: ClientEventAction = {
    type: ClientEventType.Action,
    id: `input.action-${input.event.event_id}-${input.actionIndex}`,
    operation: input.action.simple_preview.name || 'Unknown',
    senderAccount: input.action.simple_preview.description,
    timestamp: input.event.timestamp,
    iconName: 'ic-gear-28',
    amount: '−',
    time,
  };

  try {
    const isReceive =
      input.action?.data?.recipient &&
      Address.compare(input.action.data.recipient.address, input.walletAddress);

    action.isReceive = isReceive;

    const senderAccount = getSenderAccount(isReceive, input.action?.data);
    const arrowIcon = isReceive ? 'ic-tray-arrow-down-28' : 'ic-tray-arrow-up-28';
    const amountPrefix = isReceive ? '+' : '−';
    const sendOrReceiveTitle = isReceive
      ? t('transaction_type_receive')
      : t('transaction_type_sent');

    switch (input.action.type) {
      case EventActionType.TonTransfer: {
        const data = input.action.data;

        action.iconName = arrowIcon;
        action.senderAccount = senderAccount;
        action.operation = sendOrReceiveTitle;
        action.comment = data.comment;
        action.amount = formatter.formatNano(data.amount, {
          prefix: amountPrefix,
          postfix: 'TON',
        });
        break;
      }
      case EventActionType.JettonTransfer: {
        const data = input.action.data;

        action.iconName = arrowIcon;
        action.operation = sendOrReceiveTitle;
        action.senderAccount = senderAccount;
        action.amount = formatter.formatNano(data.amount, {
          decimals: data.jetton.decimals,
          postfix: data.jetton?.symbol,
          prefix: amountPrefix,
        });
        break;
      }
      case EventActionType.NftItemTransfer: {
        const data = input.action.data;

        action.iconName = arrowIcon;
        action.operation = sendOrReceiveTitle;
        action.senderAccount = senderAccount;
        action.amount = 'NFT';
        action.nftAddress = data.nft;
        break;
      }
      case EventActionType.NftPurchase:
        const data = input.action.data;

        action.iconName = arrowIcon;
        action.operation = t('transactions.nft_purchase');
        action.senderAccount = senderAccount;
        action.amount = formatter.formatNano(data.amount.value, {
          postfix: data.amount.token_name,
          prefix: amountPrefix,
        });
        break;
      case EventActionType.ContractDeploy: {
        const data = input.action.data;

        const isInitialized = Address.compare(data.address, input.walletAddress);
        action.iconName = isInitialized ? 'ic-donemark-28' : 'ic-gear-28';
        action.operation = isInitialized
          ? t('transinput.action_type_wallet_initialized')
          : t('transinput.action_type_contract_deploy');
        break;
      }
      case EventActionType.Subscribe: {
        const data = input.action.data;

        action.iconName = 'ic-bell-28';
        action.operation = t('transactions.subscription');
        action.senderAccount = data.beneficiary.name ?? '';
        action.amount = formatter.formatNano(data.amount, {
          prefix: amountPrefix,
          postfix: 'TON',
        });
        break;
      }
      case EventActionType.UnSubscribe: {
        const data = input.action.data;

        action.iconName = 'ic-xmark-28';
        action.operation = t('transactions.unsubscription');
        action.senderAccount = data.beneficiary.name ?? '';
        break;
      }
      case EventActionType.SmartContractExec: {
        const data = input.action.data;

        action.iconName = 'ic-gear-28';
        action.operation = t('transactions.smartcontract_exec');
        action.senderAccount = Address(data.contract.address).maskify();
        action.amount = formatter.formatNano(data.ton_attached, {
          prefix: amountPrefix,
          postfix: 'TON',
        });
        break;
      }
      case EventActionType.AuctionBid: {
        const data = input.action.data;

        break;
      }
      default:
      // console.log(input.action.type)
    }

    return action;
  } catch (err) {
    console.log(err);
    return action;
  }
}
