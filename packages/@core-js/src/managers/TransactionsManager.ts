import { WalletContext } from '../Wallet';
import { AccountEvent, ActionStatusEnum, CustomActionType } from '../TonAPI';
import { Address } from '../formatters/Address';
import {
  CustomAccountEventActions,
  TransactionDestination,
  CustomAccountEvent,
} from '../TonAPI';

export class TransactionsManager {
  private readonly refetchTime = 15000;
  private refetchTimer: NodeJS.Timeout | null = null;

  public persisted = undefined;

  constructor(private ctx: WalletContext) {}

  public get cacheKey() {
    return ['account_events', this.ctx.address.ton.raw];
  }

  public get tronCacheKey() {
    return ['tron_events', this.ctx.address.tron?.owner];
  }

  public async preload() {}

  public getCachedAction(txId: string) {
    const { eventId, actionIndex } = this.txIdToActionId(txId);
    const event = this.ctx.queryClient.getQueryData<AccountEvent>([
      'account_event',
      eventId,
    ]);

    if (event) {
      return this.makeCustomAccountEvent(event, actionIndex);
    }

    return null;
  }

  public async fetch(before_lt?: number) {
    const data = await this.ctx.tonapi.accounts.getAccountEvents({
      ...(!!before_lt && { before_lt }),
      accountId: this.ctx.address.ton.raw,
      subject_only: true,
      limit: 50,
    });

    data.events.map((event, index) => {
      this.ctx.queryClient.setQueryData(['account_event', event.event_id], event);

      if (index === 0 && event.in_progress) {
        this.setTimerForRefetch();
      }
    });

    return data;
  }

  public async fetchTron(fingerprint?: string) {
    const data = await this.ctx.tronapi.wallet.getTransactions({
      ...(!!fingerprint && { fingerprint }),
      ownerAddress: this.ctx.address.tron?.owner!,
      limit: 50,
    });

    data.events.map((event) => {
      this.ctx.queryClient.setQueryData(['tron_event', event.txHash], event);
    });

    return data;
  }

  public async fetchAction(txId: string) {
    const { eventId, actionIndex } = this.txIdToActionId(txId);
    const event = await this.ctx.tonapi.accounts.getAccountEvent({
      accountId: this.ctx.address.ton.raw,
      eventId,
    });

    if (event) {
      this.ctx.queryClient.setQueryData(['account_event', event.event_id], event);
      return this.makeCustomAccountEvent(event, actionIndex);
    }

    return null;
  }

  public async prefetch() {
    return this.ctx.queryClient.prefetchInfiniteQuery({
      queryFn: () => this.fetch(),
      queryKey: this.cacheKey,
    });
  }

  public async refetch() {
    this.clearRefetchTimer();
    return this.ctx.queryClient.refetchQueries({
      refetchPage: (_, index) => index === 0,
      queryKey: this.cacheKey,
    });
  }

  // Utils
  private makeCustomAccountEvent(event: AccountEvent, actionIndex: number) {
    const rawAction = event.actions[actionIndex];
    const action: CustomAccountEventActions = {
      isFailed: rawAction.status === ActionStatusEnum.Failed,
      ...rawAction,
      ...rawAction[rawAction.type],
    };

    const destination = this.defineDestination(this.ctx.address.ton.raw, action);

    if (action.type === CustomActionType.ContractDeploy) {
      action.walletInitialized = Address.compare(
        this.ctx.address.ton.raw,
        action.address,
      );
    }

    const customEvent: CustomAccountEvent = {
      ...event,
      destination,
    };

    return { event: customEvent, action };
  }

  private defineDestination(
    accountId: string,
    action: CustomAccountEventActions,
  ): TransactionDestination {
    if (action && 'recipient' in action) {
      return Address.compare(action.recipient?.address, accountId) ? 'in' : 'out';
    }

    return 'unknown';
  }

  private txIdToActionId(txId: string) {
    const ids = txId.split('_');
    const actionIndex = Number(ids[1] ?? 0);
    const eventId = ids[0];

    return { eventId, actionIndex };
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
}
