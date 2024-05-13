import { AccountEvent, TonAPI } from '@tonkeeper/core/src/TonAPI';
import {
  ActivityModel,
  ActionSource,
  ActionItem,
  ActionId,
} from '../models/ActivityModel';
import { TonRawAddress } from '../WalletTypes';
import { TronAPI } from '@tonkeeper/core';

type LoadParams<TCursor, TData> = {
  filter?: (events: TData[]) => TData[];
  cursor?: TCursor | null;
  limit?: number;
};

export class ActivityLoader {
  private tronActions = new Map<ActionId, ActionItem>();
  private tonActions = new Map<ActionId, ActionItem>();

  constructor(
    public tonRawAddress: TonRawAddress,
    private tonapi: TonAPI,
    private tronapi: TronAPI,
  ) {}

  public async loadTonActions(params: LoadParams<number, AccountEvent> = {}) {
    const limit = params.limit ?? 50;
    const data = await this.tonapi.accounts.getAccountEvents({
      before_lt: params.cursor ?? undefined,
      accountId: this.tonRawAddress,
      subject_only: true,
      limit,
    });

    const events = params.filter ? params.filter(data.events) : data.events;
    const actions = ActivityModel.createActions(
      {
        ownerAddress: this.tonRawAddress,
        source: ActionSource.Ton,
        events,
      },
      (action) => this.tonActions.set(action.action_id, action),
    );

    return {
      cursor: limit === data.events.length ? data.next_from : null,
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
    const limit = params.limit ?? 50;
    const data = await this.tonapi.accounts.getAccountJettonHistoryById({
      before_lt: params.cursor ?? undefined,
      accountId: this.tonRawAddress,
      jettonId: params.jettonId,
      limit,
    });

    const actions = ActivityModel.createActions(
      {
        ownerAddress: this.tonRawAddress,
        source: ActionSource.Ton,
        events: data.events,
      },
      (action) => {
        this.tonActions.set(action.action_id, action);
      },
    );

    return {
      cursor: limit === data.events.length ? data.next_from : null,
      actions,
    };
  }

  public async loadTonAction(actionId: ActionId) {
    const { eventId, actionIndex } = this.splitActionId(actionId);
    const event = await this.tonapi.accounts.getAccountEvent({
      accountId: this.tonRawAddress,
      eventId,
    });

    if (event) {
      const action = ActivityModel.createAction({
        ownerAddress: this.tonRawAddress,
        source: ActionSource.Ton,
        actionIndex,
        event,
      });

      this.tonActions.set(action.action_id, action);

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

  public getLoadedActions() {
    const actions: ActionItem[] = [];
    for (const map of [this.tonActions, this.tronActions]) {
      for (const [_, action] of map) {
        actions.push(action);
      }
    }

    return actions;
  }

  public setLoadedActions(actions: ActionItem[]) {
    for (const action of actions) {
      if (action.source === ActionSource.Ton) {
        this.tonActions.set(action.action_id, action);
      } else if (action.source === ActionSource.Tron) {
        this.tronActions.set(action.action_id, action);
      }
    }
  }

  private splitActionId(actionId: ActionId) {
    const ids = actionId.split('_');
    const actionIndex = Number(ids[1] ?? 0);
    const eventId = ids[0];

    return { eventId, actionIndex };
  }
}
