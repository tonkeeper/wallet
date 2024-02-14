import { BatteryAPI } from '@tonkeeper/core/src/BatteryAPI';
import { MessageConsequences } from '@tonkeeper/core/src/TonAPI';
import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { State } from '@tonkeeper/core/src/utils/State';
import { TonProofManager } from '$wallet/managers/TonProofManager';

export interface BatteryState {
  isLoading: boolean;
  balance?: string;
}

export class BatteryManager {
  public state = new State<BatteryState>({
    isLoading: false,
    balance: undefined,
  });

  constructor(
    private persistPath: string,
    private tonProof: TonProofManager,
    private batteryapi: BatteryAPI,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({ balance }) => ({ balance }),
      storage: this.storage,
      key: `${this.persistPath}/battery`,
    });
  }

  public async fetchBalance() {
    try {
      if (!this.tonProof.tonProofToken) {
        throw new Error('No proof token');
      }
      this.state.set({ isLoading: true });
      const data = await this.batteryapi.getBalance({
        headers: {
          'X-TonConnect-Auth': this.tonProof.tonProofToken,
        },
      });
      this.state.set({ isLoading: false, balance: data.balance });
    } catch (err) {
      this.state.set({ isLoading: false, balance: '0' });
      return null;
    }
  }

  public async getExcessesAccount() {
    try {
      if (!this.tonProof.tonProofToken) {
        throw new Error('No proof token');
      }

      const data = await this.batteryapi.getConfig({
        headers: {
          'X-TonConnect-Auth': this.tonProof.tonProofToken,
        },
      });

      return data.excess_account;
    } catch (err) {
      return null;
    }
  }

  public async applyPromo(promoCode: string) {
    try {
      if (!this.tonProof.tonProofToken) {
        throw new Error('No proof token');
      }

      const data = await this.batteryapi.promoCode.promoCodeBatteryPurchase(
        { promo_code: promoCode },
        {
          headers: {
            'X-TonConnect-Auth': this.tonProof.tonProofToken,
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
      if (!this.tonProof.tonProofToken) {
        throw new Error('No proof token');
      }

      const data = await this.batteryapi.ios.iosBatteryPurchase(
        { transactions: transactions },
        {
          headers: {
            'X-TonConnect-Auth': this.tonProof.tonProofToken,
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
      if (!this.tonProof.tonProofToken) {
        throw new Error('No proof token');
      }

      const data = await this.batteryapi.android.androidBatteryPurchase(
        { purchases },
        {
          headers: {
            'X-TonConnect-Auth': this.tonProof.tonProofToken,
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
      if (!this.tonProof.tonProofToken) {
        throw new Error('No proof token');
      }

      await this.batteryapi.sendMessage(
        { boc },
        {
          headers: {
            'X-TonConnect-Auth': this.tonProof.tonProofToken,
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
      if (!this.tonProof.tonProofToken) {
        throw new Error('No proof token');
      }

      return await this.batteryapi.emulate.emulateMessageToWallet(
        { boc },
        {
          headers: {
            'X-TonConnect-Auth': this.tonProof.tonProofToken,
          },
        },
      );
    } catch (err) {
      throw new Error(err);
    }
  }

  public async load() {
    return this.fetchBalance();
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }

  public async clear() {
    return this.state.clear();
  }
}
