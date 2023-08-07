import EventSource from 'react-native-sse';
import { Address, AppConfig, TonAPI } from '@tonkeeper/core';
import { QueryClient } from 'react-query';
import { AccountEvent, Event } from '../TonAPI';

export class TransactionsManager {
  constructor(
    private accountId: string,
    private queryClient: QueryClient,
    private tonapi: TonAPI, // private eventSource: EventSource
  ) {}

  // private listenAccountEvents() {
  //    // this.eventSource = new EventSource(`${config.get('tonApiKey')}/v2/sse/accounts/transactions?accounts=${this.accountId}`, {
  //   //   headers: {
  //   //     Authorization: `Bearer ${config.get('tonApiV2Key')}`,
  //   //   }
  //   // });
  //   this.sse = this.eventSource.listen(`/v2/sse/accounts/transactions?accounts=${this.accountId}`);
  //   this.sse.addEventListener('open', () => {
  //     console.log('[TransactionsManager]: start listen transactions for', this.accountId);
  //   });
  //   this.sse.addEventListener('error', (err) => {
  //     console.log('[TransactionsManager]: error listen transactions', err);
  //   });
  //   this.sse.addEventListener('message', () => this.refetch());
  // }

  private txIdToEventId(txId: string) {
    const ids = txId.split('_');
    const actionIndex = Number(ids[1] ?? 0);
    const eventId = ids[0];

    return { eventId, actionIndex };
  }

  public getCachedById(txId: string) {
    const { eventId, actionIndex } = this.txIdToEventId(txId);
    const event = this.queryClient.getQueryData<Event>(['account_event', eventId]);

    if (event) {
      return this.mapAccountEvent(event, actionIndex);
    }

    return null;
  }

  public async fetch(before_lt?: number) {
    const { data, error } = await this.tonapi.accounts.getEventsByAccount({
      ...(!!before_lt && { before_lt }),
      accountId: this.accountId,
      subject_only: true,
      limit: 50,
    });

    data.events.map((event) => {
      this.queryClient.setQueryData(['account_event', event.event_id], event);
    });

    return data.events;
  }

  public async fetchById(txId: string) {
    const { eventId, actionIndex } = this.txIdToEventId(txId);
    const { data: event } = await this.tonapi.events.getEvent(eventId);

    if (event) {
      return this.mapAccountEvent(event, actionIndex);
    }

    return null;
  }

  private mapAccountEvent(event: Event, actionIndex: number) {
    const rawAction = event.actions[actionIndex];
    const action = {
      ...rawAction,
      data: rawAction[rawAction.type],
    };

    const isReceive = detectReceive(this.accountId, action);

    return {
      ...event,
      id: event.event_id,

      sender: action.data.sender,
      recipient: action.data.recipient,

      isReceive,
      action: action,
    };
  }

  public prefetch() {
    return this.queryClient.prefetchInfiniteQuery({
      queryFn: ({ pageParam }) => fetch(pageParam),
      queryKey: ['events', this.accountId],
    });
  }

  public refetch() {}

  public destroy() {}
}

export function detectReceive(walletAddress: string, data: ActionsData['data']) {
  if (data && 'recipient' in data) {
    return Address.compare(data.recipient?.address, walletAddress);
  }

  return false;
}

type AccountEventDetailsMapperInput = {
  event: Event;
  actionIndex: number;
  accountId: string;
};
