import { WalletContext } from '../Wallet';

export class BalanceManager {
  public preloaded = undefined;
  constructor(private ctx: WalletContext) {}

  public async prefetch() {}
  public async preload() {}

  public get cacheKey() {
    return ['balance', this.ctx.accountId];
  }
}
