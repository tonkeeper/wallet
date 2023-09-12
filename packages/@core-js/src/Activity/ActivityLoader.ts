import { AccountEvent, TonAPI } from '../TonAPI';
import { WalletAddresses } from '../Wallet';
import { TronAPI } from '../TronAPI';
import {
  ActivitySource,
  ActivityModel,
  ActivityItem,
  ActionId,
} from '../models/ActivityModel';

type LoadParams<TCursor, TData> = {
  filter?: (events: TData[]) => TData[];
  cursor?: TCursor | null;
  limit?: number;
};

export class ActivityLoader {
  private tronActions = new Map<ActionId, ActivityItem>();
  private tonActions = new Map<ActionId, ActivityItem>();

  constructor(
    private addresses: WalletAddresses,
    private tonapi: TonAPI,
    private tronapi: TronAPI,
  ) {}

  public async loadTonActions(params: LoadParams<number, AccountEvent> = {}) {
    const data = await this.tonapi.accounts.getAccountEvents({
      before_lt: params.cursor ?? undefined,
      accountId: this.addresses.ton,
      limit: params.limit ?? 50,
      subject_only: true,
    });

    const events = params.filter ? params.filter(data.events) : data.events;
    const actions = ActivityModel.createActions(
      {
        ownerAddress: this.addresses.ton,
        source: ActivitySource.Ton,
        events,
      },
      (action) => this.tonActions.set(action.id, action),
    );

    return {
      cursor: data.next_from,
      actions,
    };
  }

  public async loadTronActions() {
    // if (!this.tronOwnerAddress || params.cursor === null) {
    //   return { events: [] };
    // }
    // const queryParams: GetTransactionsParams = {
    //   ownerAddress: this.tronOwnerAddress,
    //   limit: 200,
    // };
    // if (params.cursor) {
    //   // this.cursors
    //   queryParams.fingerprint = params.cursor;
    //   // queryParams.max_timestamp = 1694263271674 * 1000;
    // }
    // console.log(queryParams);
    // const data = await this.tronapi.wallet.getTransactions(queryParams);
    // const mappedEvents = data.events.map((event, index) => {
    //   const accountEvent = TransactionMapper.normalizeTronEvent(event, index);
    //   return accountEvent;
    // });
    // const events = params.filter ? params.filter(mappedEvents) : mappedEvents;
    // return { cursor: data.fingerprint, events };
  }

  public async loadJettonActions(params: {
    jettonId: string;
    cursor?: number | null;
    limit?: number;
  }) {
    const data = await this.tonapi.accounts.getAccountJettonHistoryById({
      before_lt: params.cursor ?? undefined,
      accountId: this.addresses.ton,
      limit: params.limit ?? 50,
      jettonId: params.jettonId,
    });

    const actions = ActivityModel.createActions(
      {
        ownerAddress: this.addresses.ton,
        source: ActivitySource.Ton,
        events: data.events,
      },
      (action) => {
        this.tonActions.set(action.id, action);
      },
    );

    return {
      cursor: data.next_from,
      actions,
    };
  }

  public async loadTonAction(actionId: ActionId) {
    const { eventId, actionIndex } = this.splitActionId(actionId);
    const event = await this.tonapi.accounts.getAccountEvent({
      accountId: this.addresses.ton,
      eventId,
    });

    if (event) {
      const action = ActivityModel.createAction({
        ownerAddress: this.addresses.ton,
        source: ActivitySource.Ton,
        actionIndex,
        event,
      });

      console.log(action.id);

      this.tonActions.set(action.id, action);

      return action;
    }

    return null;
  }

  public async loadTronAction(actionId: ActionId) {
    return null;
  }

  public getTronAction(actionId: ActionId) {
    if (this.tronActions.has(actionId)) {
      return this.tronActions.get(actionId)!;
    }

    return null;
  }

  public getTonAction(actionId: ActionId) {
    if (this.tonActions.has(actionId)) {
      return this.tonActions.get(actionId)!;
    }

    return null;
  }

  private splitActionId(actionId: ActionId) {
    const ids = actionId.split('_');
    const actionIndex = Number(ids[1] ?? 0);
    const eventId = ids[0];

    return { eventId, actionIndex };
  }
}
