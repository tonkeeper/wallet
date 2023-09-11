import { AccountEvent, ActionTypeEnum, GetAccountEventsParams, TonAPI } from '../TonAPI';
import { TransactionMapper } from '../models/ActivityModel/ActivityModel';
import { GetTransactionsParams } from '../TronAPI/TronAPIGenerated';
import { State } from '../utils/State';
import { TronAPI } from '../TronAPI';
import {
  AccountEventWithMaybeSource,
  TransactionSections,
} from '../models/ActivityModel';
import { WalletAddresses } from '../Wallet';

type FetchEventParams<TCursor, TData> = {
  filter?: (events: TData[]) => TData[];
  cursor?: TCursor | null;
  limit?: number;
};

type Cursors = {
  tron: number | null;
  ton: number | null;
};

type TonTransactionListState = {
  sections: TransactionSections;
  isReloading: boolean;
  isLoading: boolean;
  hasMore: boolean;
};

export class TonTransactionList {
  private cursor: number | null = null;
  private groups = {};

  public state = new State<TonTransactionListState>({
    isReloading: false,
    isLoading: false,
    hasMore: true,
    sections: [],
  });

  constructor(private address: WalletAddresses, private tonapi: TonAPI) {}

  public async load(cursor?: number) {
    try {
      this.state.set({ isLoading: true });

      if (!cursor) {
        this.groups = {};
      }

      const data = await this.tonapi.accounts.getAccountEvents({
        before_lt: cursor ?? undefined,
        accountId: this.address.ton,
        subject_only: true,
        limit: 50,
      });

      const events = this.filterEvents(data.events, [
        ActionTypeEnum.TonTransfer,
        ActionTypeEnum.SmartContractExec,
        ActionTypeEnum.ContractDeploy,
        ActionTypeEnum.JettonSwap,
        ActionTypeEnum.NftPurchase,
        ActionTypeEnum.DepositStake,
        ActionTypeEnum.WithdrawStake,
        ActionTypeEnum.WithdrawStakeRequest,
        ActionTypeEnum.ElectionsRecoverStake,
        ActionTypeEnum.ElectionsDepositStake,
      ]);

      const updatedGroups = events.reduce((groups, event) => {
        const groupKey = TransactionMapper.getGroupKey(event.timestamp);
        if (!groups[groupKey]) {
          groups[groupKey] = {
            timestamp: event.timestamp * 1000,
            data: [],
          };
        }

        const actions = TransactionMapper.createActions(event, this.address.ton);
        groups[groupKey].data.push(...actions);

        return groups;
      }, this.groups);

      this.groups = updatedGroups;

      this.state.set({
        sections: Object.values(this.groups),
        hasMore: Boolean(tonEvents.cursor),
        isLoading: false,
      });

      console.log('__END LOAD');
    } catch (err) {
      this.state.set({
        isLoading: false,
      });
    }
  }

  public async loadMore() {
    if (!this.state.data.isLoading) {
      return this.load(this.cursor);
    }
  }

  public preload() {}

  public clear() {
    this.groups = {};
  }

  public async reload() {
    this.state.set({ isReloading: true });
    await this.load();
    this.state.set({ isReloading: false });
  }

  public prefetch() {
    this.load();
  }

  // private tonGroupsKeys = new Set<string>();
  // public async fetchTonTransactions(cursor: number) {
  //   const data = await this.fetchTonEvents({ cursor: cursor });
  //   const events = filterEventsByActionType(data.events, [
  //     ActionTypeEnum.TonTransfer,
  //     ActionTypeEnum.SmartContractExec,
  //     ActionTypeEnum.ContractDeploy,
  //     ActionTypeEnum.JettonSwap,
  //     ActionTypeEnum.NftPurchase,
  //     ActionTypeEnum.DepositStake,
  //     ActionTypeEnum.WithdrawStake,
  //     ActionTypeEnum.WithdrawStakeRequest,
  //     ActionTypeEnum.ElectionsRecoverStake,
  //     ActionTypeEnum.ElectionsDepositStake,
  //   ]);

  //   const items = events.reduce<TransactionItems>((items, event, index) => {
  //     this.queryClient.setQueryData(['account_event', event.event_id], event);
  //     if (index === 0 && event.in_progress) {
  //       this.setTimerForRefetch();
  //     }

  //     const groupKey = TransactionMapper.getGroupKey(event.timestamp);
  //     if (!this.tonGroupsKeys.has(groupKey)) {
  //       this.tonGroupsKeys.add(groupKey);
  //       const section = TransactionMapper.createSection(event.timestamp);
  //       items.push(section);
  //     }

  //     const actions = TransactionMapper.createActions(event, this.tonRawAddress);
  //     items.push(...actions);

  //     return items;
  //   }, []);

  //   return { cursor: data.cursor, items };
  // }

  // private tronGroupsKeys = new Set<string>();
  // public async fetchTronTransactions(cursor: string) {
  //   const data = await this.fetchTronEvents({ cursor: cursor });

  //   const items = data.events.reduce<TransactionItems>((items, event, index) => {
  //     this.queryClient.setQueryData(['account_event', event.event_id], event);
  //     if (index === 0 && event.in_progress) {
  //       this.setTimerForRefetch();
  //     }

  //     const groupKey = TransactionMapper.getGroupKey(event.timestamp);
  //     if (!this.tronGroupsKeys.has(groupKey)) {
  //       this.tronGroupsKeys.add(groupKey);
  //       const section = TransactionMapper.createSection(event.timestamp);
  //       items.push(section);
  //     }

  //     const accountId =
  //       event.source === TransactionEventSource.Tron
  //         ? this.tronOwnerAddress!
  //         : this.tonRawAddress;
  //     const actions = TransactionMapper.createActions(event, accountId);
  //     items.push(...actions);

  //     return items;
  //   }, []);

  //   return { cursor: data.cursor, items };
  // }

  public async fetchTonEvents(params: FetchEventParams<number, AccountEvent> = {}) {
    if (!this.tronOwnerAddress || params.cursor === null) {
      return { events: [] as AccountEvent[] };
    }

    const events = params.filter ? params.filter(data.events) : data.events;

    return { cursor: data.next_from, events };
  }

  public async fetchTronEvents(
    params: FetchEventParams<string, AccountEventWithMaybeSource> = {},
  ): Promise<{
    events: AccountEventWithMaybeSource[];
    cursor?: string;
  }> {
    if (!this.tronOwnerAddress || params.cursor === null) {
      return { events: [] };
    }

    const queryParams: GetTransactionsParams = {
      ownerAddress: this.tronOwnerAddress,
      limit: 200,
    };

    if (params.cursor) {
      // this.cursors
      queryParams.fingerprint = params.cursor;
      // queryParams.max_timestamp = 1694263271674 * 1000;
    }

    console.log(queryParams);

    const data = await this.tronapi.wallet.getTransactions(queryParams);
    const mappedEvents = data.events.map((event, index) => {
      const accountEvent = TransactionMapper.normalizeTronEvent(event, index);
      return accountEvent;
    });

    const events = params.filter ? params.filter(mappedEvents) : mappedEvents;

    return { cursor: data.fingerprint, events };
  }

  // public async fetchTransactionAction(actionId: string) {
  //   const { eventId, actionIndex } = this.splitActionId(actionId);
  //   const event = await this.tonapi.accounts.getAccountEvent({
  //     accountId: this.tonRawAddress,
  //     eventId,
  //   });

  //   if (event) {
  //     this.queryClient.setQueryData(['account_event', event.event_id], event);
  //     return TransactionMapper.createAction(event, actionIndex, this.tonRawAddress);
  //   }

  //   return null;
  // }

  // public getCachedAction(actionId: string) {
  //   const { eventId, actionIndex } = this.splitActionId(actionId);
  //   const event = this.queryClient.getQueryData<AccountEvent>(['account_event', eventId]);

  //   if (event) {
  //     return TransactionMapper.createAction(event, actionIndex, this.tonRawAddress);
  //   }

  //   return null;
  // }

  // public async prefetch() {
  //   return this.queryClient.prefetchInfiniteQuery({
  //     queryFn: () => this.(),
  //     queryKey: this.getTonCacheKey(),
  //   });
  // }

  // public async refetch() {
  //   this.clearReloadTask();
  //   return this.queryClient.refetchQueries({
  //     refetchPage: (_, index) => index === 0,
  //     queryKey: this.getTonCacheKey(),
  //   });
  // }

  // private splitActionId(actionId: string) {
  //   const ids = actionId.split('_');
  //   const actionIndex = Number(ids[1] ?? 0);
  //   const eventId = ids[0];

  //   return { eventId, actionIndex };
  // }


  private filterEvents = (events: AccountEvent[], types: ActionTypeEnum[]) => {
    return events.reduce<AccountEvent[]>((acc, event) => {
      const pass = event.actions.every((action) => {
        for (let type of types) {
          if (action.type === type) {
            return true;
          }
        }
  
        return false;
      });
  
      if (pass) {
        acc.push(event);
      }
  
      return acc;
    }, []);
  }
}