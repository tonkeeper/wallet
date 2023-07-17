import { formatTransactionsPeriodDate, formatDate } from '@tonkeeper/shared/utils/date';
import { AccountEvent, ActionTypeEnum } from '@tonkeeper/core/src/TonAPI';
import { formatter } from '@tonkeeper/shared/formatter';
import { t } from '@tonkeeper/shared/i18n';
import { Address } from '@tonkeeper/core';
import {
  getGroupDate,
  detectReceive,
  getSenderAccount,
} from './AccountEventsMapper.utils';
import {
  ActionsData,
  ActionsWithData,
  ClientEvent,
  ClientEventAction,
  ClientEventType,
  GroupedActionsByDate,
} from './AccountEventsMapper.types';

export function AccountEventsMapper(events: AccountEvent[], walletAddress: string) {
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
    const formatDatetedDate = formatTransactionsPeriodDate(new Date(txTime));

    acc.push({
      type: ClientEventType.Date,
      id: `date-${formatDatetedDate}`,
      date: formatDatetedDate,
    });

    acc.push(...actions);

    return acc;
  }, [] as ClientEvent[]);
}

export function EventMapper(event: AccountEvent, walletAddress: string) {
  const countAction = event.actions.length;
  const actions = event.actions.reduce<ClientEventAction[]>(
    (actions, serverAction, index) => {
      const actionByType = serverAction[serverAction.type] as ActionsData['data'];
      const actionWithData = Object.assign(serverAction, {
        type: serverAction.type,
        data: actionByType,
      }) as ActionsWithData;

      const action = EventsActionMapper({
        action: actionWithData,
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
    },
    [],
  );

  return actions;
}

type EventsActionMapperInput = {
  walletAddress: string;
  action: ActionsWithData;
  actionIndex: number;
  event: AccountEvent;
};

export function EventsActionMapper(input: EventsActionMapperInput): ClientEventAction {
  const time = formatDate(new Date(input.event.timestamp * 1000), 'HH:mm');

  // By default SimplePreview
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
    const isReceive = detectReceive(input.walletAddress, input.action.data);
    const senderAccount = getSenderAccount(isReceive, input.action.data);
    const arrowIcon = isReceive ? 'ic-tray-arrow-down-28' : 'ic-tray-arrow-up-28';
    const amountPrefix = isReceive ? '+' : '−';
    const sendOrReceiveTitle = isReceive
      ? t('transaction_type_receive')
      : t('transaction_type_sent');

    action.isReceive = isReceive;

    switch (input.action.type) {
      case ActionTypeEnum.TonTransfer: {
        const data = input.action.data;

        action.iconName = arrowIcon;
        action.senderAccount = senderAccount;
        action.operation = sendOrReceiveTitle;
        action.comment = data.comment?.trim();
        action.amount = formatter.formatNano(data.amount, {
          prefix: amountPrefix,
          postfix: 'TON',
        });
        break;
      }
      case ActionTypeEnum.JettonTransfer: {
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
      case ActionTypeEnum.NftItemTransfer: {
        const data = input.action.data;

        action.iconName = arrowIcon;
        action.operation = sendOrReceiveTitle;
        action.senderAccount = senderAccount;
        action.amount = 'NFT';
        action.nftAddress = data.nft;
        break;
      }
      case ActionTypeEnum.NftPurchase:
        const data = input.action.data;

        action.iconName = arrowIcon;
        action.operation = t('transactions.nft_purchase');
        action.senderAccount = senderAccount;
        action.amount = formatter.formatNano(data.amount.value, {
          postfix: data.amount.token_name,
          prefix: amountPrefix,
        });
        break;
      case ActionTypeEnum.ContractDeploy: {
        const data = input.action.data;

        const isInitialized = Address.compare(data.address, input.walletAddress);
        action.iconName = isInitialized ? 'ic-donemark-28' : 'ic-gear-28';
        action.operation = isInitialized
          ? t('transinput.action_type_wallet_initialized')
          : t('transinput.action_type_contract_deploy');
        break;
      }
      case ActionTypeEnum.Subscribe: {
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
      case ActionTypeEnum.UnSubscribe: {
        const data = input.action.data;

        action.iconName = 'ic-xmark-28';
        action.operation = t('transactions.unsubscription');
        action.senderAccount = data.beneficiary.name ?? '';
        break;
      }
      case ActionTypeEnum.SmartContractExec: {
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
      case ActionTypeEnum.AuctionBid: {
        const data = input.action.data;
        
        break;
      }
      case ActionTypeEnum.Unknown: {
        action.operation = t('transactions.unknown');
        action.senderAccount = t('transactions.unknown_description');
        break;
      }
      default:
       console.log(input.action.type)
    }

    return action;
  } catch (err) {
    console.log(err);
    return action;
  }
}
