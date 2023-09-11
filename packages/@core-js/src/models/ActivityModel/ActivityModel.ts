import { differenceInCalendarMonths, format } from 'date-fns';
import { ActionStatusEnum, AccountEvent } from '../../TonAPI';
import { toLowerCaseFirstLetter } from '../../utils/strings';
import { TronEvent } from '../../TronAPI/TronAPIGenerated';
import { Address } from '../../formatters/Address';
import {
  AnyActivityAction,
  ActionDestination,
  ActivityActionType,
  ActivityActionAmount,
  ActivityItem,
  ActivitySource,
  ActivityItems,
} from './ActivityTypes';

type CreateActionOptions = {
  source: ActivitySource;
  event: AccountEvent;
  ownerAddress: string;
  actionIndex: number;
};

type CreateActionsOptions = {
  source: ActivitySource;
  events: AccountEvent[];
  ownerAddress: string;
};

type IterationFN = (action: ActivityItem) => void;

export class ActivityModel {
  static getGroupKey(timestamp: number) {
    const ts = new Date(timestamp * 1000);
    const now = new Date();

    if (differenceInCalendarMonths(now, ts) < 1) {
      return format(ts, 'd MMMM');
    }

    return format(ts, 'LLLL yyyy');
  }

  static createActions(options: CreateActionsOptions, fn?: IterationFN) {
    return options.events.reduce<ActivityItems>((activityActions, event) => {
      const eventActions = event.actions.reduce<ActivityItem[]>((actions, _, index) => {
        const action = ActivityModel.createAction({
          ownerAddress: options.ownerAddress,
          source: options.source,
          actionIndex: index,
          event,
        });

        actions.push(action);
        return actions;
      }, []);

      activityActions.push(...eventActions);

      return activityActions;
    }, []);
  }

  static createAction({
    ownerAddress,
    actionIndex,
    source,
    event,
  }: CreateActionOptions): ActivityItem {
    const rawAction = event.actions[actionIndex];
    const actionBody = rawAction[rawAction.type];

    const destination = this.defineActionDestination(ownerAddress, actionBody);

    const type = (rawAction as any).type as ActivityActionType;
    const amount = this.createAmount({ ...actionBody, type });

    const action: AnyActivityAction = {
      type,
      ...actionBody,
      isFailed: rawAction.status === ActionStatusEnum.Failed,
      simple_preview: rawAction.simple_preview,
      status: rawAction.status,
      destination,
      amount,
    };

    return {
      id: `${event.event_id}_${actionIndex}`,
      isLast: actionIndex === event.actions.length - 1,
      isFirst: actionIndex === 0,
      source,
      action,
      event,
    };
  }

  static createAmount(action: AnyActivityAction): ActivityActionAmount | null {
    switch (action.type) {
      case ActivityActionType.WithdrawStakeRequest:
      case ActivityActionType.ElectionsRecoverStake:
      case ActivityActionType.ElectionsDepositStake:
      case ActivityActionType.TonTransfer:
      case ActivityActionType.DepositStake:
      case ActivityActionType.WithdrawStake:
        if (action.amount !== undefined) {
          return {
            value: String(action.amount),
            symbol: 'TON',
          };
        }

        return null;
      case ActivityActionType.JettonMint:
      case ActivityActionType.JettonBurn:
      case ActivityActionType.JettonTransfer:
        return {
          value: action.amount,
          symbol: action.jetton.symbol,
          decimals: action.jetton.decimals,
        };
      case ActivityActionType.NftPurchase:
      case ActivityActionType.AuctionBid:
      case ActivityActionType.NftPurchase:
        return {
          value: action.amount.value,
          symbol: action.amount.token_name,
        };
      case ActivityActionType.SmartContractExec:
        return {
          value: action.ton_attached,
          symbol: 'TON',
        };
      case ActivityActionType.ReceiveTRC20:
      case ActivityActionType.SendTRC20:
        return {
          value: action.amount,
          symbol: action.token.symbol,
          decimals: action.token.decimals,
        };
      case ActivityActionType.JettonSwap:
      case ActivityActionType.NftItemTransfer:
      case ActivityActionType.ContractDeploy:
      case ActivityActionType.Subscribe:
      case ActivityActionType.UnSubscribe:
      default:
        return null;
    }
  }

  static defineActionDestination(
    ownerAddress: string,
    action: AnyActivityAction,
  ): ActionDestination {
    if (action && 'recipient' in action) {
      if (typeof action.recipient === 'object') {
        return Address.compare(action.recipient?.address, ownerAddress) ? 'in' : 'out';
      } else if (typeof action.recipient === 'string') {
        return action.recipient === ownerAddress ? 'in' : 'out';
      }
    }

    return 'unknown';
  }

  static normalizeTronEvent(event: TronEvent, eventIndex: number) {
    return {
      source: ActivitySource.Tron,
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
