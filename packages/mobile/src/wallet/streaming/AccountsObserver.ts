import { config } from '$config';
import { NamespacedLogger, logger } from '$logger';

export interface AccountTransactionEvent {
  jsonrpc: '2.0';
  method: 'account_transaction';
  params: {
    account_id: string;
    lt: number;
    tx_hash: string;
  };
}

export type AccountsStreamEvent = AccountTransactionEvent;

export type AccountsStreamCallback = (event: AccountsStreamEvent) => void;

interface Subscriber {
  accountId: string;
  callback: AccountsStreamCallback;
}

export class AccountsStream {
  private subscribers: Set<Subscriber> = new Set();
  private socket: WebSocket | null = null;
  private lastId = 0;
  private isOpened = false;
  private logger: NamespacedLogger;

  constructor(private isTestnet: boolean) {
    this.logger = logger.extend(
      `AccountsStream ${this.isTestnet ? 'testnet' : 'mainnet'}`,
    );
  }

  private open() {
    const endpoint = this.isTestnet
      ? config.get('tonapiTestnetWsEndpoint')
      : config.get('tonapiWsEndpoint');

    this.socket = new WebSocket(
      `${endpoint}?token=${config.get('tonApiV2Key', this.isTestnet)}`,
    );

    this.socket.onopen = () => {
      this.logger.info('socket opened');
      this.isOpened = true;
      this.lastId = 0;

      const accountIds = new Set<string>();

      for (const subscriber of this.subscribers.values()) {
        accountIds.add(subscriber.accountId);
      }

      if (accountIds.size > 0) {
        this.send('subscribe_account', Array.from(accountIds));
      }
    };

    this.socket.onmessage = (socketEvent) => {
      const event = JSON.parse(socketEvent.data);

      if (event.method === 'account_transaction') {
        for (const subscriber of this.subscribers.values()) {
          if (subscriber.accountId === event.params.account_id) {
            subscriber.callback(event);
          }
        }
      } else if (event.result) {
        this.logger.debug(event.result);
      }
    };

    this.socket.onclose = () => {
      this.logger.error('socket closed');
      this.socket = null;
      this.isOpened = false;

      if (this.subscribers.size > 0) {
        setTimeout(() => this.open(), 1000);
      }
    };
  }

  private send(method: string, params?: string | string[]) {
    try {
      if (!this.socket || !this.isOpened) {
        return;
      }

      this.lastId++;

      this.socket.send(
        JSON.stringify({
          id: this.lastId,
          jsonrpc: '2.0',
          method,
          params,
        }),
      );

      this.logger.debug('sent', method, params);
    } catch {}
  }

  public subscribe(accountId: string, callback: AccountsStreamCallback) {
    const subscriber = { accountId, callback };
    this.subscribers.add(subscriber);

    const accountSubscribers = [...this.subscribers.values()].filter(
      (item) => item.accountId === accountId,
    );

    if (accountSubscribers.length === 1) {
      this.send('subscribe_account', [accountId]);
    }

    if (!this.socket) {
      this.open();
    }

    return () => {
      this.subscribers.delete(subscriber);

      if (this.subscribers.size === 0) {
        this.socket?.close();
      } else {
        const subscribersAfter = [...this.subscribers.values()].filter(
          (item) => item.accountId === accountId,
        );

        if (subscribersAfter.length === 0) {
          this.send('unsubscribe_account', [accountId]);
        }
      }
    };
  }
}
