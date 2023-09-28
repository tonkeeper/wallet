import { WalletContext } from '../Wallet';

export class BalancesManager {
  public preloaded = undefined;
  constructor(private ctx: WalletContext) {}

  public async prefetch() {
    this.fetchTron();
  }
  public async preload() {}

  public get tonCacheKey() {
    return ['balance', this.ctx.address.ton.raw];
  }

  public get tronCacheKey() {
    return ['balance', this.ctx.address.tron?.owner];
  }

  public async fetchTron() {
    if (!this.ctx.address.tron?.proxy) return;

    const data = await this.ctx.tronapi.balance.getWalletBalances(
      this.ctx.address.tron.proxy,
    );

    return  data.balances;
  }
}
