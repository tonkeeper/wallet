import { formatter } from '@tonkeeper/shared/formatter';
import { t } from '@tonkeeper/shared/i18n';
import { Address } from '@tonkeeper/core';
import {
  detectReceive,
  findSenderAccount,
  getSenderAddress,
  getSenderPicture,
} from './AccountEventsMapper.utils';
import {
  AccountEvent,
  Action,
  ActionStatusEnum,
  ActionTypeEnum,
} from '@tonkeeper/core/src/TonAPI';
import {
  ActionsData,
  ActionsWithData,
  MappedEvent,
  MappedEventAction,
  MappedEventItemType,
  GroupedActionsByDate,
} from './AccountEventsMapper.types';
import {
  formatTransactionTime,
  getDateForGroupTansactions,
  formatTransactionsGroupDate,
} from '@tonkeeper/shared/utils/date';

export function AccountEventsMapper(events: AccountEvent[], walletAddress: string = '') {
  const groupedActions = events.reduce<GroupedActionsByDate>((groups, event) => {
    const date = getDateForGroupTansactions(event.timestamp);

    if (!groups[date]) {
      groups[date] = [];
    }

    const actions = EventMapper(event, walletAddress);
    groups[date].push(...actions);

    return groups;
  }, {});

  return Object.keys(groupedActions).reduce<MappedEvent[]>((acc, date) => {
    const actions = groupedActions[date];
    const txTime = actions[0].timestamp * 1000;
    const formatDatetedDate = formatTransactionsGroupDate(new Date(txTime));

    acc.push({
      contentType: MappedEventItemType.Date,
      id: `date-${formatDatetedDate}`,
      date: formatDatetedDate,
    });

    acc.push(...actions);

    return acc;
  }, []);
}

export function mergeActionWithData(inputAction: Action) {
  const action = { ...inputAction };
  const actionByType = action[action.type] as ActionsData['data'];
  return Object.assign(action, {
    type: action.type,
    data: actionByType,
  }) as ActionsWithData;
}

export function EventMapper(event: AccountEvent, walletAddress: string) {
  const countAction = event.actions.length;
  const actions = event.actions.reduce<MappedEventAction[]>(
    (actions, serverAction, index) => {
      const action = EventsActionMapper({
        action: mergeActionWithData(serverAction),
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

export function EventsActionMapper(input: EventsActionMapperInput): MappedEventAction {
  const time = formatTransactionTime(new Date(input.event.timestamp * 1000));

  // SimplePreview by default
  const action: MappedEventAction = {
    contentType: MappedEventItemType.Action,
    id: `${input.event.event_id}_${input.actionIndex}`,
    eventId: input.event.event_id,
    operation: input.action.simple_preview.name || 'Unknown',
    subtitle: input.action.simple_preview.description,
    inProgress: input.event.in_progress,
    timestamp: input.event.timestamp,
    encryptedComment:
      input.action.TonTransfer?.encrypted_comment ||
      input.action.JettonTransfer?.encrypted_comment,
    sender:
      input.action[input.action.type]?.sender &&
      getSenderAddress(input.action[input.action.type].sender),
    iconName: 'ic-gear-28',
    type: 'SimplePreview',
    isScam: false,
    amount: '−',
    time,
  };

  try {
    const isReceive = detectReceive(input.walletAddress, input.action.data);
    const senderAccount = findSenderAccount(isReceive, input.action.data);
    const senderAddress = senderAccount.address.short;
    const arrowIcon = isReceive ? 'ic-tray-arrow-down-28' : 'ic-tray-arrow-up-28';
    const amountPrefix = isReceive ? '+' : '−';
    const sendOrReceiveTitle = isReceive
      ? t('transaction_type_receive')
      : t('transaction_type_sent');

    action.isReceive = isReceive;
    action.picture = senderAccount.picture;

    switch (input.action.type) {
      case ActionTypeEnum.TonTransfer: {
        const data = input.action.data;

        action.iconName = arrowIcon;
        action.subtitle = senderAddress;
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
        action.subtitle = senderAddress;
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
        action.subtitle = senderAddress;
        action.amount = 'NFT';
        action.nftAddress = data.nft;
        break;
      }
      case ActionTypeEnum.NftPurchase:
        const data = input.action.data;

        action.nftItem = data.nft;
        action.iconName = 'ic-shopping-bag-28';
        action.operation = t('transactions.nft_purchase');
        action.subtitle = getSenderAddress(data.seller).short;
        action.picture = getSenderPicture(data.seller);
        action.amount = formatter.formatNano(data.amount.value, {
          postfix: data.amount.token_name,
          prefix: amountPrefix,
        });
        break;
      case ActionTypeEnum.ContractDeploy: {
        const data = input.action.data;

        const isInitialized = Address.compare(data.address, input.walletAddress);
        action.iconName = isInitialized ? 'ic-donemark-28' : 'ic-gear-28';
        action.subtitle = Address(data.address).toShort();
        action.operation = isInitialized
          ? t('transactions.wallet_initialized')
          : t('transactions.contract_deploy');
        break;
      }
      case ActionTypeEnum.Subscribe: {
        const data = input.action.data;

        action.iconName = 'ic-bell-28';
        action.operation = t('transactions.subscription');
        action.subtitle = data.beneficiary.name ?? '';
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
        action.subtitle = data.beneficiary.name ?? '';
        break;
      }
      case ActionTypeEnum.SmartContractExec: {
        const data = input.action.data;
        action.iconName = 'ic-gear-28';
        action.operation = t('transactions.smartcontract_exec');
        action.subtitle = Address(data.contract.address).toShort();
        action.amount = formatter.formatNano(data.ton_attached, {
          prefix: amountPrefix,
          postfix: 'TON',
        });
        break;
      }
      case ActionTypeEnum.AuctionBid: {
        const data = input.action.data;

        // TODO: need backend fixes;
        console.log(input.action.type);
        break;
      }
      case ActionTypeEnum.Unknown: {
        action.operation = t('transactions.unknown');
        action.subtitle = t('transactions.unknown_description');
        break;
      }
      case ActionTypeEnum.JettonSwap: {
        const data = input.action.data;

        action.iconName = 'ic-swap-horizontal-alternative-28';
        action.operation = t('transactions.swap');
        action.subtitle = data.user_wallet.name
          ? data.user_wallet.name
          : Address(data.user_wallet.address).toShort();
        action.isReceive = true;
        action.amount = formatter.formatNano(data.amount_in, {
          decimals: data.jetton_master_in.decimals,
          postfix: data.jetton_master_in.symbol,
          prefix: '+',
        });
        action.amount2 = formatter.formatNano(data.amount_out, {
          decimals: data.jetton_master_out.decimals,
          postfix: data.jetton_master_out.symbol,
          prefix: '−',
        });
        break;
      }
    }

    if (isReceive && input.event.is_scam) {
      action.operation = t('transactions.spam');
      action.comment = undefined;
      action.nftItem = undefined;
      action.nftAddress = undefined;
      action.isScam = true;
    }

    if (input.action.status === ActionStatusEnum.Failed) {
      action.iconName = 'ic-exclamationmark-circle-28';
      action.picture = null;
      action.isFailed = true;
    }

    action.type = input.action.type;

    return action;
  } catch (err) {
    console.log(err);
    return action;
  }
}
