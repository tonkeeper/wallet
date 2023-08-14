import { WalletContext } from '../Wallet';
import { AccountEvent, ActionStatusEnum, CustomActionType } from '../TonAPI';
import { Address } from '../Address';
import {
  CustomAccountEventActions,
  TransactionDestination,
  CustomAccountEvent,
} from '../TonAPI';

export class TransactionsManager {
  public persisted = undefined;

  constructor(private ctx: WalletContext) {}

  public get cacheKey() {
    return ['account_events', this.ctx.accountId];
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
      accountId: this.ctx.accountId,
      subject_only: true,
      limit: 50,
    });

    data.events.map((event) => {
      this.ctx.queryClient.setQueryData(['account_event', event.event_id], event);
    });

    return data;
  }

  public async fetchAction(txId: string) {
    const { eventId, actionIndex } = this.txIdToActionId(txId);
    const event = await this.ctx.tonapi.accounts.getAccountEvent({
      accountId: this.ctx.accountId,
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
    

    const destination = this.defineDestination(this.ctx.accountId, action);

    if (action.type === CustomActionType.ContractDeploy) {
      action.walletInitialized = Address.compare(action.address, this.ctx.accountId);
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
}
