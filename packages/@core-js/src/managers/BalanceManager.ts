import { WalletContext } from "../Wallet";

export class BalanceManager {
  public preloaded = undefined;
  constructor(private ctx: WalletContext) {}

  public get cacheKey() {
    return ['balance', this.ctx.accountId];
  }
}