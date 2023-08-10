import {
  Account,
  AccountEvent,
  Action,
  ActionTypeEnum,
  AuctionBidAction,
  ContractDeployAction,
  DepositStakeAction,
  JettonSwapAction,
  JettonTransferAction,
  NftItemTransferAction,
  NftPurchaseAction,
  RecoverStakeAction,
  SmartContractAction,
  SubscriptionAction,
  TonTransferAction,
  UnSubscriptionAction,
} from '../TonAPI';
import { Address } from '../Address';
import { WalletContext } from '../Wallet';

export class TransactionsManager {
  public persisted = undefined;

  constructor(private context: WalletContext) {}

  public get cacheKey() {
    return ['account_events', this.context.accountId];
  }

  public getCachedById(txId: string) {
    const { eventId, actionIndex } = this.txIdToEventId(txId);
    const event = this.context.queryClient.getQueryData<AccountEvent>(['account_event', eventId]);

    if (event) {
      return this.mapAccountEvent(event, actionIndex);
    }

    return null;
  }

  public async fetch(before_lt?: number) {
    const { data, error } = await this.context.tonapi.accounts.getAccountEvents({
      ...(!!before_lt && { before_lt }),
      accountId: this.context.accountId,
      subject_only: true,
      limit: 50,
    });

    // TODO: change
    if (error) {
      throw error;
    }

    data.events.map((event) => {
      this.context.queryClient.setQueryData(['account_event', event.event_id], event);
    });

    return data;
  }

  public async fetchById(txId: string) {
    const { eventId, actionIndex } = this.txIdToEventId(txId);
    const { data: event } = await this.context.tonapi.accounts.getAccountEvent({
      accountId: this.context.accountId,
      eventId,
    });

    if (event) {
      this.context.queryClient.setQueryData(['account_event', event.event_id], event);
      return this.mapAccountEvent(event, actionIndex);
    }

    return null;
  }

  private mapAccountEvent(event: AccountEvent, actionIndex: number) {
    const rawAction = event.actions[actionIndex];
    const action = {
      ...rawAction,
      ...rawAction[rawAction.type],
    };

    // Extract amount
    if (action.amount) {
      if (typeof action.amount === 'number') {
        action.amount = {
          tokenName: 'TON',
          value: action.amount,
        };
      } else if (typeof action.amount === 'object') {
        action.amount = {
          tokenName: action.amount.token_name,
          value: action.amount.value,
        };
      }
    }

    if (action.type === ActionTypeEnum.JettonTransfer) {
      action.amount = {
        tokenAddress: action.jetton.address,
        decimals: action.jetton.decimals,
        tokenName: action.jetton.symbol,
        value: action.amount,
      };
    }

    const destination = this.defineDestination(this.context.accountId, action);
    const transaction: Transaction = {
      ...event,
      hash: event.event_id,
      destination,
      action,
    };

    if (rawAction.type === ActionTypeEnum.TonTransfer) {
      transaction.encrypted_comment = action.encrypted_comment;
    }

    return transaction;
  }

  public async prefetch() {
    return this.context.queryClient.prefetchInfiniteQuery({
      queryFn: () => this.fetch(),
      queryKey: this.cacheKey,
    });
  }

  public async refetch() {
    return this.context.queryClient.refetchQueries({
      refetchPage: (_, index) => index === 0,
      queryKey: this.cacheKey,
    });
  }

  // Utils
  private defineDestination(
    accountId: string,
    data: any, //ActionsData['data'],
  ): TransactionDestination {
    if (data && 'recipient' in data) {
      return Address.compare(data.recipient.address, accountId) ? 'in' : 'out';
    }

    return 'unknown';
  }

  private txIdToEventId(txId: string) {
    const ids = txId.split('_');
    const actionIndex = Number(ids[1] ?? 0);
    const eventId = ids[0];

    return { eventId, actionIndex };
  }
}

export type TransactionDestination = 'out' | 'in' | 'unknown';

export const TxActionEnum = {
  ...ActionTypeEnum,
} as const;

export type ActionAmount = {
  tokenAddress?: string;
  tokenName: string;
  decimals?: number;
  value: string;
};

export type TonTransferActionData = {
  type: ActionTypeEnum.TonTransfer;
  data: TonTransferAction;
};

export type JettonTransferActionData = {
  type: ActionTypeEnum.JettonTransfer;
  data: JettonTransferAction;
};

export type NftItemTransferActionData = {
  type: ActionTypeEnum.NftItemTransfer;
  data: NftItemTransferAction;
};

export type ContractDeployActionData = {
  type: ActionTypeEnum.ContractDeploy;
  data: ContractDeployAction;
};

export type SubscribeActionData = {
  type: ActionTypeEnum.Subscribe;
  data: SubscriptionAction;
};

export type UnSubscribeActionData = {
  type: ActionTypeEnum.UnSubscribe;
  data: UnSubscriptionAction;
};

export type AuctionBidActionData = {
  type: ActionTypeEnum.AuctionBid;
  data: AuctionBidAction;
};

export type NftPurchaseActionData = {
  type: ActionTypeEnum.NftPurchase;
  data: NftPurchaseAction;
};

export type SmartContractExecActionData = {
  type: ActionTypeEnum.SmartContractExec;
  data: SmartContractAction;
};

export type UnknownActionData = {
  type: ActionTypeEnum.Unknown;
  data: undefined;
};

export type DepositStakeActionData = {
  type: ActionTypeEnum.DepositStake;
  data: DepositStakeAction;
};

export type RecoverStakeActionData = {
  type: ActionTypeEnum.RecoverStake;
  data: RecoverStakeAction;
};

export type STONfiSwapActionData = {
  type: ActionTypeEnum.JettonSwap;
  data: JettonSwapAction;
};

export type ActionsData =
  | TonTransferActionData
  | JettonTransferActionData
  | NftItemTransferActionData
  | ContractDeployActionData
  | SubscribeActionData
  | UnSubscribeActionData
  | AuctionBidActionData
  | NftPurchaseActionData
  | UnknownActionData
  | SmartContractExecActionData
  | DepositStakeActionData
  | RecoverStakeActionData
  | STONfiSwapActionData;

export type ActionsWithData = Omit<Action, 'type'> &
  ActionsData & {
    amount?: ActionAmount;
  };

export type Transaction = {
  hash: string;
  sender?: Account;
  recipient?: Account;
  action: ActionsWithData;
  destination: TransactionDestination;
  timestamp: number;
  extra?: number;
  encrypted_comment?: any;
  comment?: string;
  is_scam: boolean;
};
