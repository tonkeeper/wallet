import { WalletContext } from '../Wallet';

export class JettonsManager {
  public preloaded = undefined;
  constructor(private ctx: WalletContext) {}

  public async prefetch() {}
  public async preload() {}

  public get cacheKey() {
    return ['jettons', this.ctx.accountId];
  }
}
