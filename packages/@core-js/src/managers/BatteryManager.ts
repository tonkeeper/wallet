import { WalletContext, WalletIdentity } from '../Wallet';
import { MessageConsequences } from '../TonAPI';
import { Storage } from '../declarations/Storage';
import { State } from '../utils/State';

export interface BatteryState {
  isLoading: boolean;
  balance?: string;
}

export const batteryState = new State<BatteryState>({
  isLoading: false,
  balance: undefined,
});

export class BatteryManager {
  public state = batteryState;

  constructor(
    private ctx: WalletContext,
    private identity: WalletIdentity,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({ balance }) => ({ balance }),
      storage: this.storage,
      key: 'battery',
    });
  }

  public async fetchBalance() {
    try {
      this.state.set({ isLoading: true });
      const data = await this.ctx.batteryapi.getBalance({
        headers: {
          'X-TonConnect-Auth': this.identity.tonProof,
        },
      });
      this.state.set({ isLoading: false, balance: data.balance });
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
        this.fetchBalance();
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

      await this.fetchBalance();

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

      await this.fetchBalance();

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
          headers: {
            'X-TonConnect-Auth': this.identity.tonProof,
          },
          format: 'text',
        },
      );

      await this.fetchBalance();
    } catch (err) {
      throw new Error(err);
    }
  }

  public async emulate(boc: string): Promise<MessageConsequences> {
    try {
      return await this.ctx.batteryapi.emulate.emulateMessageToWallet(
        { boc },
        {
          headers: {
            'X-TonConnect-Auth': this.identity.tonProof,
          },
        },
      );
    } catch (err) {
      throw new Error(err);
    }
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }

  public async clear() {
    return this.state.clear();
  }
}
