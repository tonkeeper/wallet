import { differenceInCalendarMonths, format } from 'date-fns';
import { ActionStatusEnum, AccountEvent } from '../../TonAPI';
import { toLowerCaseFirstLetter } from '../../utils/strings';
import { TronEvent } from '../../TronAPI/TronAPIGenerated';
import { Address } from '../../formatters/Address';
import {
  TransactionItemSection,
  TransactionItemAction,
  AnyTransactionAction,
  TransactionItemType,
  ActionDestination,
  TransactionEventSource,
  AccountEventWithMaybeSource,
  TransactionEvent,
  TransactionActionType,
  TransactionActionAmount,
} from './TransactionTypes';

export class TransactionMapper {
  static getGroupKey(timestamp: number) {
    const ts = new Date(timestamp * 1000);
    const now = new Date();

    if (differenceInCalendarMonths(now, ts) < 1) {
      return format(ts, 'd MMMM');
    }

    return format(ts, 'LLLL yyyy');
  }

  static createSection(timestamp: number): TransactionItemSection {
    const utime = timestamp * 1000;
    return {
      type: TransactionItemType.Section,
      id: `section-${utime}`,
      timestamp: utime,
    };
  }

  static createActions(event: AccountEvent, accountId: string) {
    return event.actions.reduce<TransactionItemAction[]>((actions, _, index) => {
      actions.push(this.createAction(event, index, accountId));
      return actions;
    }, []);
  }

  static createAction(
    event: AccountEventWithMaybeSource,
    actionIndex: number,
    accountId: string,
  ): TransactionItemAction {
    const rawAction = event.actions[actionIndex];
    const actionBody = rawAction[rawAction.type];

    const destination = this.defineActionDestination(accountId, actionBody);

    const type = (rawAction as any).type as TransactionActionType;
    const amount = this.mapAmount({ ...actionBody, type });

    const action: AnyTransactionAction = {
      type,
      ...actionBody,
      isFailed: rawAction.status === ActionStatusEnum.Failed,
      simple_preview: rawAction.simple_preview,
      status: rawAction.status,
      destination,
      amount,
    };

    if (!event.source) {
      event.source = TransactionEventSource.Ton;
    }

    return {
      type: TransactionItemType.Action,
      id: `action-${event.event_id}-${actionIndex}`,
      isLast: actionIndex === event.actions.length - 1,
      event: event as TransactionEvent,
      isFirst: actionIndex === 0,
      action,
    };
  }

  static mapAmount(action: AnyTransactionAction): TransactionActionAmount | null {
    switch (action.type) {
      case TransactionActionType.WithdrawStakeRequest:
      case TransactionActionType.ElectionsRecoverStake:
      case TransactionActionType.ElectionsDepositStake:
      case TransactionActionType.TonTransfer:
      case TransactionActionType.DepositStake:
      case TransactionActionType.WithdrawStake:
        if (action.amount !== undefined) {
          return {
            value: String(action.amount),
            symbol: 'TON',
          };
        }

        return null;
      case TransactionActionType.JettonMint:
      case TransactionActionType.JettonBurn:
      case TransactionActionType.JettonTransfer:
        return {
          value: action.amount,
          symbol: action.jetton.symbol,
          decimals: action.jetton.decimals,
        };
      case TransactionActionType.NftPurchase:
      case TransactionActionType.AuctionBid:
      case TransactionActionType.NftPurchase:
        return {
          value: action.amount.value,
          symbol: action.amount.token_name,
        };
      case TransactionActionType.SmartContractExec:
        return {
          value: action.ton_attached,
          symbol: 'TON',
        };
      case TransactionActionType.ReceiveTRC20:
      case TransactionActionType.SendTRC20:
        return {
          value: action.amount,
          symbol: action.token.symbol,
          decimals: action.token.decimals,
        };
      case TransactionActionType.JettonSwap:
      case TransactionActionType.NftItemTransfer:
      case TransactionActionType.ContractDeploy:
      case TransactionActionType.Subscribe:
      case TransactionActionType.UnSubscribe:
      default:
        return null;
    }
  }

  static defineActionDestination(
    walletAddress: string,
    action: AnyTransactionAction,
  ): ActionDestination {
    if (action && 'recipient' in action) {
      if (typeof action.recipient === 'object') {
        return Address.compare(action.recipient?.address, walletAddress) ? 'in' : 'out';
      } else if (typeof action.recipient === 'string') {
        return action.recipient === walletAddress ? 'in' : 'out';
      }
    }

    return 'unknown';
  }

  static normalizeTronEvent(event: TronEvent, eventIndex: number) {
    return {
      source: TransactionEventSource.Tron,
      event_id: event.txHash + eventIndex,
      timestamp: event.timestamp / 1000,
      in_progress: event.inProgress,
      account: { address: '', is_scam: false },
      is_scam: false,
      lt: 0,
      extra: event.fees ? Number(event.fees.amount) : 0,
      actions: event.actions.map((action) => ({
        ...(action as any),
        [action.type]: action[toLowerCaseFirstLetter(action.type)],
        simple_preview: {
          name: action.type,
          description: '',
        },
      })),
    };
  }
}
