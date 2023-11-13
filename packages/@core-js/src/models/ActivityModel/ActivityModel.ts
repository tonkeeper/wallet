import { AccountEvent, Action, ActionStatusEnum } from '../../TonAPI';
import { differenceInCalendarMonths, format } from 'date-fns';
import { toLowerCaseFirstLetter } from '../../utils/strings';
import { TronEvent } from '../../TronAPI/TronAPIGenerated';
import { Address } from '../../formatters/Address';
import { nanoid } from 'nanoid/non-secure';
import {
  ActionAmount,
  ActionAmountType,
  ActionDestination,
  ActionItem,
  ActionSource,
  ActionType,
  AnyActionItem,
  AnyActionPayload,
  AnyActionTypePayload,
} from './ActivityModelTypes';

type CreateActionOptions = {
  source: ActionSource;
  event: AccountEvent;
  ownerAddress: string;
  actionIndex: number;
};

type CreateActionsOptions = {
  source: ActionSource;
  events: AccountEvent[];
  ownerAddress: string;
};

type ExtendedAction = Action & { Unknown: undefined };

export class ActivityModel {
  static getGroupKey(timestamp: number) {
    const ts = new Date(timestamp * 1000);
    const now = new Date();

    if (differenceInCalendarMonths(now, ts) < 1) {
      return format(ts, 'd MMMM');
    }

    return format(ts, 'LLLL yyyy');
  }

  static createActions(
    options: CreateActionsOptions,
    iteration?: (action: ActionItem) => void,
  ) {
    return options.events.reduce<AnyActionItem[]>((activityActions, event) => {
      const eventActions = event.actions.reduce<AnyActionItem[]>((actions, _, index) => {
        const action = ActivityModel.createAction({
          ownerAddress: options.ownerAddress,
          source: options.source,
          actionIndex: index,
          event,
        });

        if (iteration) {
          iteration(action);
        }

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
  }: CreateActionOptions): AnyActionItem {
    const action = event.actions[actionIndex];

    if (!action) {
      throw new Error('[ActivityModel]: action is undefined');
    }

    const type = (action as any).type as ActionType;
    const payload = (action as any)[type] as AnyActionPayload;
    const destination = this.defineActionDestination(ownerAddress, type, payload);
    // @ts-ignore TODO: fix types
    const amount = this.createAmount({ type, payload });

    // @ts-ignore TODO: fix types
    return {
      action_id: `${event.event_id}_${actionIndex}`,
      simple_preview: action.simple_preview,
      isLast: actionIndex === event.actions.length - 1,
      isFirst: actionIndex === 0,
      status: action.status,
      destination,
      payload,
      amount,
      source,
      initialActionType: ActionType[event.actions[event.actions.length - 1].type],
      event,
      type,
    };
  }

  static createMockAction<T extends ActionType>(
    ownerAddress: string,
    action: AnyActionTypePayload<T>,
  ): AnyActionItem {
    const destination = this.defineActionDestination(
      ownerAddress,
      action.type,
      action.payload,
    );
    const amount = this.createAmount(action);

    return {
      initialActionType: action.type,
      status: ActionStatusEnum.Ok,
      source: ActionSource.Ton,
      payload: action.payload,
      action_id: nanoid(),
      type: (action as any).type,
      isFirst: false,
      isLast: false,
      destination,
      amount,
      event: {
        event_id: nanoid(),
        timestamp: +new Date() / 1000,
        in_progress: false,
        is_scam: false,
        lt: +new Date(),
        extra: 0,
        account: {
          address: ownerAddress,
          is_scam: false,
        },
      },
      simple_preview: {
        description: 'Mock Action',
        name: action.type,
        accounts: [],
      },
    };
  }

  static createAmount(action: AnyActionTypePayload): ActionAmount | null {
    const { payload, type } = action;

    switch (type) {
      case ActionType.WithdrawStakeRequest:
      case ActionType.ElectionsRecoverStake:
      case ActionType.ElectionsDepositStake:
      case ActionType.TonTransfer:
      case ActionType.DepositStake:
      case ActionType.WithdrawStake:
      case ActionType.Subscribe:
        if (payload.amount !== undefined) {
          return {
            type: ActionAmountType.Ton,
            value: String(payload.amount),
            symbol: 'TON',
            decimals: 9,
          };
        } else {
          return null;
        }
      case ActionType.JettonMint:
      case ActionType.JettonBurn:
      case ActionType.JettonTransfer:
        return {
          type: ActionAmountType.Jetton,
          jettonAddress: payload.jetton.address,
          decimals: payload.jetton.decimals,
          symbol: payload.jetton.symbol,
          value: payload.amount,
        };
      case ActionType.NftPurchase:
      case ActionType.AuctionBid:
        return {
          type: ActionAmountType.Ton,
          symbol: payload.amount.token_name,
          value: payload.amount.value,
          decimals: 9,
        };
      case ActionType.SmartContractExec:
        return {
          type: ActionAmountType.Ton,
          value: String(payload.ton_attached),
          symbol: 'TON',
          decimals: 9,
        };
      case ActionType.ReceiveTRC20:
      case ActionType.SendTRC20:
        return {
          type: ActionAmountType.Tron,
          value: payload.amount,
          symbol: payload.token.symbol,
          decimals: payload.token.decimals,
        };
      default:
        return null;
    }
  }

  static defineActionDestination(
    ownerAddress: string,
    actionType: ActionType,
    payload: AnyActionPayload,
  ): ActionDestination {
    if (
      actionType === ActionType.WithdrawStake ||
      actionType === ActionType.WithdrawStakeRequest
    ) {
      return 'in';
    }

    if (payload && 'recipient' in payload) {
      if (typeof payload.recipient === 'object') {
        return Address.compare(payload.recipient?.address, ownerAddress) ? 'in' : 'out';
      } else if (typeof payload.recipient === 'string') {
        return payload.recipient === ownerAddress ? 'in' : 'out';
      }
    }

    return 'unknown';
  }

  static normalizeTronEvent(event: TronEvent, eventIndex: number) {
    return {
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
