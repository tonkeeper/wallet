import { AccountEvent } from '../TonAPI';
import { WalletContext } from '../Wallet';
import { TransactionItems, TransactionMapper } from '../mappers/TransactionMapper';
import { toLowerCaseFirstLetter } from '../utils/strings';

type JettonAddress = string;

type GroupKey = {
  [key: string]: boolean;
};

type TransactionsGroups = {
  [key: JettonAddress]: GroupKey;
};

export class JettonsManager {
  public preloaded = undefined;
  constructor(private ctx: WalletContext) {}

  public async prefetch() {}
  public async preload() {}

  public get cacheKey() {
    return ['jettons', this.ctx.address.ton.raw];
  }

  transactionsGroups: TransactionsGroups = {};

  public remapTransactions(jettonAddress: JettonAddress, legacyEvents: any) {
    const items = Object.values(legacyEvents).reduce<TransactionItems>(
      (items, oldEvent: any) => {
        const event: AccountEvent = {
          ...oldEvent,
          event_id: oldEvent.eventId,
          account: oldEvent.account
            ? {
                ...oldEvent.account,
                is_scam: oldEvent.account.isScam,
              }
            : undefined,
          is_scam: oldEvent.isScam,
          in_progress: oldEvent.inProgress,
          actions: oldEvent.actions.map((action) => ({
            ...action,
            simple_preview: action.simplePreview,
            [action.type]: action[toLowerCaseFirstLetter(action.type)],
          })),
        };

        this.ctx.queryClient.setQueryData(['account_event', event.event_id], event);
        const groupKey = TransactionMapper.getGroupKey(event.timestamp);
        if (!this.transactionsGroups[jettonAddress]) {
          this.transactionsGroups[jettonAddress] = {};
        }

        console.log(this.transactionsGroups[jettonAddress][groupKey]);

        if (!this.transactionsGroups[jettonAddress][groupKey]) {
          this.transactionsGroups[jettonAddress][groupKey] = true;
          const section = TransactionMapper.createSection(event.timestamp);
          items.push(section);
        }

        const actions = TransactionMapper.createActions(event, this.ctx.address.ton.raw);
        items.push(...actions);

        return items;
      },
      [],
    );

    return items;
  }
}
