import { WalletContext } from '../Wallet';

export class JettonsManager {
  public preloaded = undefined;
  constructor(private ctx: WalletContext) {}

  public get cacheKey() {
    return ['jettons', this.ctx.accountId];
  }
}
