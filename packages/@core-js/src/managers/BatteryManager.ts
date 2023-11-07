import { WalletContext, WalletIdentity } from '../Wallet';

export class BatteryManager {
  constructor(private ctx: WalletContext, private identity: WalletIdentity) {}

  public get cacheKey() {
    return ['battery', this.ctx.address.ton.raw];
  }

  public async getBalance() {
    try {
      const data = await this.ctx.batteryapi.getBalance({
        headers: {
          'X-TonConnect-Auth': this.identity.tonProof,
        },
      });

      return data.balance;
    } catch (err) {
      return null;
    }
  }

  public async getExcessesAccount() {
    try {
      const data = await this.ctx.batteryapi.getConfig({
        headers: {
          'X-TonConnect-Auth': this.identity.tonProof,
        },
      });

      return data.excess_account;
    } catch (err) {
      return null;
    }
  }

  public async applyPromo(promoCode: string) {
    try {
      const data = await this.ctx.batteryapi.promoCode.promoCodeBatteryPurchase(
        { promo_code: promoCode },
        {
          headers: {
            'X-TonConnect-Auth': this.identity.tonProof,
          },
        },
      );

      if (data.success) {
        this.getBalance();
      }

      return data;
    } catch (err) {
      return { success: false, error: { msg: 'Unexpected error' } };
    }
  }

  public async makeIosPurchase(transactions: { id: string }[]) {
    try {
      const data = await this.ctx.batteryapi.ios.iosBatteryPurchase(
        { transactions: transactions },
        {
          headers: {
            'X-TonConnect-Auth': this.identity.tonProof,
          },
        },
      );

      await this.getBalance();

      return data.transactions;
    } catch (err) {
      console.log('[ios battery in-app purchase]', err);
    }
  }

  public async makeAndroidPurchase(purchases: { token: string; product_id: string }[]) {
    try {
      const data = await this.ctx.batteryapi.android.androidBatteryPurchase(
        { purchases },
        {
          headers: {
            'X-TonConnect-Auth': this.identity.tonProof,
          },
        },
      );

      await this.getBalance();

      return data.purchases;
    } catch (err) {
      console.log('[android battery in-app purchase]', err);
    }
  }

  public async sendMessage(boc: string) {
    try {
      await this.ctx.batteryapi.sendMessage(
        { boc },
        {
          format: 'text',
          headers: {
            'X-TonConnect-Auth': this.identity.tonProof,
          },
        },
      );

      await this.getBalance();
    } catch (err) {
      console.log('[battery sendMessage]', err);
      throw new Error(err);
    }
  }
}
