import EventSource from 'react-native-sse';
import { config } from "../config";
import { AppConfig } from '@tonkeeper/core';
import { QueryClient } from 'react-query';

class TransactionsManager {
  private sse: EventSource | null = null;

  constructor(
    private wallet: Wallet
  ) {
    
    // this.listenAccountEvents();
  }

  private listenAccountEvents() {
    this.sse = new EventSource(`${config.get('tonApiKey')}/v2/sse/accounts/transactions?accounts=${this.accountId}`, {
      headers: {
        Authorization: `Bearer ${config.get('tonApiV2Key')}`,
      }
    });

    this.sse.addEventListener('open', () => {
      console.log('[TransactionsManager]: start listen transactions for', this.accountId);
    });

    this.sse.addEventListener('error', (err) => {
      console.log('[TransactionsManager]: error listen transactions', err);
    });

    this.sse.addEventListener('message', () => {
      this.refetch();
    });
  }

  public refetch() {
    // await queryClient.refetchQueries({
    //   refetchPage: (_, index) => index === 0,
    //   queryKey: getEventsQueryKey(accountId),
    //   exact: true,
    // })
  }

  public destroy() {
    this.sse?.close();
  }
}
