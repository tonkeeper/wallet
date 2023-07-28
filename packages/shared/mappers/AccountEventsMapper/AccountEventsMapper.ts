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
  Event,
} from '@tonkeeper/core/src/TonAPI';
import { formatter } from '@tonkeeper/shared/formatter';
import { t } from '@tonkeeper/shared/i18n';
import { Address } from '@tonkeeper/core';
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
      type: MappedEventItemType.Date,
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
    type: MappedEventItemType.Action,
    id: `${input.event.event_id}_${input.actionIndex}`,
    operation: input.action.simple_preview.name || 'Unknown',
    senderAccount: input.action.simple_preview.description,
    inProgress: input.event.in_progress,
    timestamp: input.event.timestamp,
    iconName: 'ic-gear-28',
    isScam: false,
    amount: '−',
    time,
  };

  try {
    const isReceive = detectReceive(input.walletAddress, input.action.data);
    const senderAccount = findSenderAccount(isReceive, input.action.data);
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
        action.senderAccount = senderAccount.address;
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
        action.senderAccount = senderAccount.address;
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
        action.senderAccount = senderAccount.address;
        action.amount = 'NFT';
        action.nftAddress = data.nft;
        break;
      }
      case ActionTypeEnum.NftPurchase:
        const data = input.action.data;

        action.nftItem = data.nft;
        action.iconName = 'ic-shopping-bag-28';
        action.operation = t('transactions.nft_purchase');
        action.senderAccount = getSenderAddress(data.seller);
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
        action.senderAccount = Address(data.address).maskify();
        action.operation = isInitialized
          ? t('transactions.wallet_initialized')
          : t('transactions.contract_deploy');
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

        // TODO: need backend fixes;
        console.log(input.action.type);
        break;
      }
      case ActionTypeEnum.Unknown: {
        action.operation = t('transactions.unknown');
        action.senderAccount = t('transactions.unknown_description');
        break;
      }
      case ActionTypeEnum.JettonSwap: {
        const data = input.action.data;

        action.iconName = 'ic-swap-horizontal-alternative-28';
        action.operation = t('transactions.swap');
        action.senderAccount = data.user_wallet.name
          ? data.user_wallet.name
          : Address(data.user_wallet.address).maskify();
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

    if (input.event.is_scam) {
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

    return action;
  } catch (err) {
    console.log(err);
    return action;
  }
}

// type EventActionDetailsMapperInput = {
//   walletAddress: string;
//   event: AccountEvent;
//   action: Action;
// };

// function EventActionDetailsMapper(input: EventActionDetailsMapperInput) {
//   const time = formatTransactionTime(new Date(input.event.timestamp * 1000));
//   const action = mergeActionWithData(input.action);

//   // SimplePreview by default
//   const details: MappedEventAction = {
//     type: MappedEventItemType.Action,
//     id: `${input.event.event_id}_${input.actionIndex}`,
//     operation: input.action.simple_preview.name || 'Unknown',
//     senderAccount: input.action.simple_preview.description,
//     inProgress: input.event.in_progress,
//     timestamp: input.event.timestamp,
//     iconName: 'ic-gear-28',
//     isScam: false,
//     amount: '−',
//     time,
//   };

//   try {
//     switch (action.type) {
//       case ActionTypeEnum.TonTransfer: {
//         const data = action.data;
  
//         details.iconName = arrowIcon;
//         details.senderAccount = senderAccount.address;
//         details.operation = sendOrReceiveTitle;
//         details.comment = data.comment?.trim();
//         details.amount = formatter.formatNano(data.amount, {
//           prefix: amountPrefix,
//           postfix: 'TON',
//         });
//         break;
//       }
//       case ActionTypeEnum.JettonTransfer: {
//         const data = action.data;
  
//         details.iconName = arrowIcon;
//         details.operation = sendOrReceiveTitle;
//         details.senderAccount = senderAccount.address;
//         details.amount = formatter.formatNano(data.amount, {
//           decimals: data.jetton.decimals,
//           postfix: data.jetton?.symbol,
//           prefix: amountPrefix,
//         });
//         break;
//       }
//       case ActionTypeEnum.NftItemTransfer: {
//         const data = action.data;
  
//         details.iconName = arrowIcon;
//         details.operation = sendOrReceiveTitle;
//         details.senderAccount = senderAccount.address;
//         details.amount = 'NFT';
//         details.nftAddress = data.nft;
//         break;
//       }
//       case ActionTypeEnum.NftPurchase:
//         const data = action.data;
  
//         details.nftItem = data.nft;
//         details.iconName = 'ic-shopping-bag-28';
//         details.operation = t('transactions.nft_purchase');
//         details.senderAccount = getSenderAddress(data.seller);
//         details.picture = getSenderPicture(data.seller);
//         details.amount = formatter.formatNano(data.amount.value, {
//           postfix: data.amount.token_name,
//           prefix: amountPrefix,
//         });
//         break;
//       case ActionTypeEnum.ContractDeploy: {
//         const data = action.data;
  
//         const isInitialized = Address.compare(data.address, input.walletAddress);
//         details.iconName = isInitialized ? 'ic-donemark-28' : 'ic-gear-28';
//         details.senderAccount = Address(data.address).maskify();
//         details.operation = isInitialized
//           ? t('transactions.wallet_initialized')
//           : t('transactions.contract_deploy');
//         break;
//       }
//       case ActionTypeEnum.Subscribe: {
//         const data = action.data;
  
//         details.iconName = 'ic-bell-28';
//         details.operation = t('transactions.subscription');
//         details.senderAccount = data.beneficiary.name ?? '';
//         details.amount = formatter.formatNano(data.amount, {
//           prefix: amountPrefix,
//           postfix: 'TON',
//         });
//         break;
//       }
//       case ActionTypeEnum.UnSubscribe: {
//         const data = action.data;
  
//         details.iconName = 'ic-xmark-28';
//         details.operation = t('transactions.unsubscription');
//         details.senderAccount = data.beneficiary.name ?? '';
//         break;
//       }
//       case ActionTypeEnum.SmartContractExec: {
//         const data = action.data;
  
//         details.iconName = 'ic-gear-28';
//         details.operation = t('transactions.smartcontract_exec');
//         details.senderAccount = Address(data.contract.address).maskify();
//         details.amount = formatter.formatNano(data.ton_attached, {
//           prefix: amountPrefix,
//           postfix: 'TON',
//         });
//         break;
//       }
//       case ActionTypeEnum.AuctionBid: {
//         const data = action.data;
  
//         // TODO: need backend fixes;
//         console.log(input.action.type);
//         break;
//       }
//       case ActionTypeEnum.Unknown: {
//         details.operation = t('transactions.unknown');
//         details.senderAccount = t('transactions.unknown_description');
//         break;
//       }
//       case ActionTypeEnum.JettonSwap: {
//         const data = action.data;
  
//         details.iconName = 'ic-swap-horizontal-alternative-28';
//         details.operation = t('transactions.swap');
//         details.senderAccount = data.user_wallet.name
//           ? data.user_wallet.name
//           : Address(data.user_wallet.address).maskify();
//           details.isReceive = true;
//         details.amount = formatter.formatNano(data.amount_in, {
//           decimals: data.jetton_master_in.decimals,
//           postfix: data.jetton_master_in.symbol,
//           prefix: '+',
//         });
//         details.amount2 = formatter.formatNano(data.amount_out, {
//           decimals: data.jetton_master_out.decimals,
//           postfix: data.jetton_master_out.symbol,
//           prefix: '−',
//         });
//         break;
//       }
//     }

//     return details;
//   } catch (err) {
//     console.log('[EventActionDetailsMapper]:', err);
//     return details;
//   }
// }
