import { AccountEvent } from '../TonAPI';
import { WalletContext } from '../Wallet';
import { TransactionMapper } from '../mappers/TransactionMapper';
import { toLowerCaseFirstLetter } from '../utils/strings';

export class JettonsManager {
  public preloaded = undefined;
  constructor(private ctx: WalletContext) {}

  public async prefetch() {}
  public async preload() {}

  public get cacheKey() {
    return ['jettons', this.ctx.address.ton.raw];
  }

  public remap(legacyEvents: any) {
    const events = Object.values(legacyEvents).reduce<AccountEvent[]>(
      (acc, item: any) => {
        const event: AccountEvent = {
          ...item,
          event_id: item.eventId,
          account: item.account
            ? {
                ...item.account,
                is_scam: item.account.isScam,
              }
            : undefined,
          is_scam: item.isScam,
          in_progress: item.inProgress,
          actions: item.actions.map((action) => ({
            ...action,
            simple_preview: action.simplePreview,
            [action.type]: action[toLowerCaseFirstLetter(action.type)],
          })),
        };

        acc.push(event);

        return acc;
      },
      [],
    );

    // return TransactionMapper(events, this.ctx.address.ton.raw);
  }
}
