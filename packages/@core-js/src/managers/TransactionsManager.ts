import { AccountEvent, ActionTypeEnum, GetAccountEventsParams, TonAPI } from '../TonAPI';
import { TransactionMapper } from '../mappers/TransactionMapper/TransactionMapper';
import { GetTransactionsParams } from '../TronAPI/TronAPIGenerated';
import { QueryClient } from 'react-query';
import { TronAPI } from '../TronAPI';
import {
  AccountEventWithMaybeSource,
  TransactionEventSource,
  TransactionItems,
} from '../mappers/TransactionMapper';

type FetchEventParams<TCursor, TData> = {
  filter?: (events: TData[]) => TData[];
  cursor?: TCursor | null;
  limit?: number;
};

export class TransactionsManager {
  private readonly refetchTime = 15000;
  private refetchTimer: NodeJS.Timeout | null = null;

  public persisted = undefined;

  constructor(
    private tonRawAddress: string,
    private tronOwnerAddress: string | undefined,
    private tonapi: TonAPI,
    private tronapi: TronAPI,
    private queryClient: QueryClient,
  ) {}

  public getTonCacheKey(...other: string[]) {
    return ['account_events', this.tonRawAddress, ...other];
  }

  public async preload() {}

  private groupsKeys = new Set<string>();

  public async fetchAllTransactions(cursor?: {
    ton: number | null;
    tron: string | null;
  }) {
    const tonEvents = await this.fetchTonEvents({ cursor: cursor?.ton });
    const tronEvents = await this.fetchTronEvents({ cursor: cursor?.tron });

    const mergedEvents = [...tonEvents.events, ...tronEvents.events].sort(
      (a, b) => b.timestamp - a.timestamp,
    );

    const items = mergedEvents.reduce<TransactionItems>((items, event, index) => {
      this.queryClient.setQueryData(['account_event', event.event_id], event);
      if (index === 0 && event.in_progress) {
        this.setTimerForRefetch();
      }

      const groupKey = TransactionMapper.getGroupKey(event.timestamp);
      if (!this.groupsKeys.has(groupKey)) {
        this.groupsKeys.add(groupKey);
        const section = TransactionMapper.createSection(event.timestamp);
        items.push(section);
      }

      const actions = TransactionMapper.createActions(event, this.tonRawAddress);
      items.push(...actions);

      return items;
    }, []);

    return {
      items,
      cursor: {
        tron: tronEvents.cursor ?? null,
        ton: tonEvents.cursor ?? null,
      },
    };
  }

  private tonGroupsKeys = new Set<string>();
  public async fetchTonTransactions(cursor: number) {
    const data = await this.fetchTonEvents({ cursor: cursor });
    const events = filterEventsByActionType(data.events, [
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

    const items = events.reduce<TransactionItems>((items, event, index) => {
      this.queryClient.setQueryData(['account_event', event.event_id], event);
      if (index === 0 && event.in_progress) {
        this.setTimerForRefetch();
      }

      const groupKey = TransactionMapper.getGroupKey(event.timestamp);
      if (!this.tonGroupsKeys.has(groupKey)) {
        this.tonGroupsKeys.add(groupKey);
        const section = TransactionMapper.createSection(event.timestamp);
        items.push(section);
      }

      const actions = TransactionMapper.createActions(event, this.tonRawAddress);
      items.push(...actions);

      return items;
    }, []);

    return { cursor: data.cursor, items };
  }

  private tronGroupsKeys = new Set<string>();
  public async fetchTronTransactions(cursor: string) {
    const data = await this.fetchTronEvents({ cursor: cursor });

    const items = data.events.reduce<TransactionItems>((items, event, index) => {
      this.queryClient.setQueryData(['account_event', event.event_id], event);
      if (index === 0 && event.in_progress) {
        this.setTimerForRefetch();
      }

      const groupKey = TransactionMapper.getGroupKey(event.timestamp);
      if (!this.tronGroupsKeys.has(groupKey)) {
        this.tronGroupsKeys.add(groupKey);
        const section = TransactionMapper.createSection(event.timestamp);
        items.push(section);
      }

      const accountId =
        event.source === TransactionEventSource.Tron
          ? this.tronOwnerAddress!
          : this.tonRawAddress;
      const actions = TransactionMapper.createActions(event, accountId);
      items.push(...actions);

      return items;
    }, []);

    return { cursor: data.cursor, items };
  }

  public async fetchTonEvents(params: FetchEventParams<number, AccountEvent> = {}) {
    if (!this.tronOwnerAddress || params.cursor === null) {
      return { events: [] };
    }

    const queryParams: GetAccountEventsParams = {
      accountId: this.tonRawAddress,
      limit: params.limit ?? 50,
      subject_only: true,
    };

    if (params.cursor) {
      queryParams.before_lt = params.cursor;
    }

    const data = await this.tonapi.accounts.getAccountEvents(queryParams);
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
      limit: 50,
    };

    if (params.cursor) {
      queryParams.fingerprint = params.cursor;
    }

    const data = await this.tronapi.wallet.getTransactions(queryParams);
    const mappedEvents = data.events.map((event, index) => {
      const accountEvent = TransactionMapper.normalizeTronEvent(event, index);
      this.queryClient.setQueryData(
        ['account_event', accountEvent.event_id],
        accountEvent,
      );
      return accountEvent;
    });

    const events = params.filter ? params.filter(mappedEvents) : mappedEvents;

    return { cursor: data.fingerprint, events };
  }

  public async fetchTransactionAction(actionId: string) {
    const { eventId, actionIndex } = this.splitActionId(actionId);
    const event = await this.tonapi.accounts.getAccountEvent({
      accountId: this.tonRawAddress,
      eventId,
    });

    if (event) {
      this.queryClient.setQueryData(['account_event', event.event_id], event);
      return TransactionMapper.createAction(event, actionIndex, this.tonRawAddress);
    }

    return null;
  }

  public getCachedAction(actionId: string) {
    const { eventId, actionIndex } = this.splitActionId(actionId);
    const event = this.queryClient.getQueryData<AccountEvent>(['account_event', eventId]);

    if (event) {
      return TransactionMapper.createAction(event, actionIndex, this.tonRawAddress);
    }

    return null;
  }

  public async prefetch() {
    return this.queryClient.prefetchInfiniteQuery({
      queryFn: () => this.fetchAllTransactions(),
      queryKey: this.getTonCacheKey(),
    });
  }

  public async refetch() {
    this.clearRefetchTimer();
    return this.queryClient.refetchQueries({
      refetchPage: (_, index) => index === 0,
      queryKey: this.getTonCacheKey(),
    });
  }

  private setTimerForRefetch() {
    this.clearRefetchTimer();
    this.refetchTimer = setTimeout(() => {
      this.refetch();
      this.refetchTimer = null;
    }, this.refetchTime);
  }

  private clearRefetchTimer() {
    if (this.refetchTimer !== null) {
      clearTimeout(this.refetchTimer);
    }
  }

  private splitActionId(actionId: string) {
    const ids = actionId.split('_');
    const actionIndex = Number(ids[1] ?? 0);
    const eventId = ids[0];

    return { eventId, actionIndex };
  }
}

const filterEventsByActionType = (events: AccountEvent[], types: ActionTypeEnum[]) => {
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
};
