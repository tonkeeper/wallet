import { t } from '$translation';
import { compareAddresses, format, formatDate, getLocale } from '$utils';
import { IconNames } from '@tonkeeper/uikit';

import { ServerAccountEvent, EventAction, SimplePreview, EventActionType } from './Events.types';
import { differenceInCalendarMonths } from 'date-fns';
import { WalletAddress } from './ActivityScreen';

import {
  ClientEvent,
  ClientEventAction,
  ClientEventType,
  GroupedActionsByDate,
} from '@tonkeeper/shared/components/TransactionList/DataTypes';

// const getSenderAccount = (isReceive: boolean, action: SimplePreview) => {
//   const senderAccount = isReceive ? action.sender : action.recipient;
//   if (senderAccount) {
//     if (senderAccount.name) {
//       return senderAccount.name
//     }

//     return Ton.formatAddress(senderAccount.address, { cut: true });
//   }

//   return '';
// }

function getGroupDate(timestamp: number) {
  const ts = timestamp * 1000;
  const now = new Date();

  if (differenceInCalendarMonths(now, new Date(ts)) < 1) {
    return format(new Date(ts), 'd MMMM', { locale: getLocale() });
  }

  return format(new Date(ts), 'LLLL');
}

export function EventsMapper(events: ServerAccountEvent[], walletAddress: WalletAddress) {
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

export function EventMapper(event: ServerAccountEvent, walletAddress: WalletAddress) {
  const countAction = event.actions.length;
  const actions = event.actions.reduce((actions, serverAction, index) => {
    const action = EventsActionMapper({
      action: serverAction,
      actionIndex: index,
      walletAddress,
      event,
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
  walletAddress: WalletAddress;
  event: any;
  action: EventAction;
  actionIndex: number;
};



export function EventsActionMapper(input: EventsActionMapperInput): ClientEventAction {
  const action: ClientEventAction = {
    id: `input.action-${input.event.event_id}-${input.actionIndex}`,
    type: ClientEventType.Action,
    iconName: 'ic-gear-28',
    title: input.action.simple_preview.name || 'Unknown',
    subtitle: input.action.simple_preview.description,
    timestamp: input.event.timestamp,
  };

  try {
    const walletRawAddress = input.walletAddress.raw;
    const time = format(new Date(input.event.timestamp * 1000), 'HH:mm');
    const isReceive = false;
    // const isReceive = input.action.accounts.find(
    //   compareAddresses(input.action.recipient.address, walletRawAddress),
    // );

    // const arrowIcon = isReceive ? 'ic-tray-arrow-down-28' : 'ic-tray-arrow-up-28';

    
    

    // console.log(input.action);

    // action.subtitle = senderAccount;
    // action.subvalue = time;
    // action.value = '-';

    // if (input.action.amount) { // TODO: rewrite
    //   const amount = TonWeb.utils.fromNano(Math.abs(input.action.amount).toString());
    //   item.value = amountPrefix + ' ' + truncateDecimal(amount.toString(), 2, false, true) + ' ' +
    //     formatCryptoCurrency(
    //       '',
    //       CryptoCurrencies.Ton,
    //       Decimals[CryptoCurrencies.Ton],
    //       undefined,
    //       true,
    //     ).trim();
    // }

    switch (input.action.type) {
      case EventActionType.TonTransfer:
        action.iconName = arrowIcon;
        action.title = isReceive ? t('activity.received') : t('activity.sent');
        break;
      case EventActionType.Subscribe:
        action.iconName = 'ic-bell-28';
        action.title = t('transinput.action_type_subscription');
        break;
      case EventActionType.UnSubscribe:
        action.iconName = 'ic-bell-28';
        action.title = t('transinput.action_type_unsubscription');
        break;
      // case EventActionType.ContractDeploy:
      //   const isInitialized = compareAddresses(input.action, myAddress);
      //   action.iconName = isInitialized ? 'ic-donemark-28' : 'ic-gear-28';
      //   action.title = isInitialized
      //     ? t('transinput.action_type_wallet_initialized')
      //     : t('transinput.action_type_contract_deploy');

      //   console.log(input.action);
      //   break;
      // TODO:
      case EventActionType.JettonTransfer:
      case EventActionType.NftItemTransfer:
        action.value = 'NFT';
        break;
      case EventActionType.ContractDeploy:
      case EventActionType.AuctionBid:
    }

    return action;
  } catch(err) {
    console.log(err);
    return action;
  }
}
