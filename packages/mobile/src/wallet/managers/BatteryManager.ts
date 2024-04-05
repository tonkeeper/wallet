import { BatteryAPI, UnitsEnum } from '@tonkeeper/core/src/BatteryAPI';
import { MessageConsequences } from '@tonkeeper/core/src/TonAPI';
import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { State } from '@tonkeeper/core/src/utils/State';
import { TonProofManager } from '$wallet/managers/TonProofManager';
import { logger, NamespacedLogger } from '$logger';

export enum BatterySupportedTransaction {
  Swap = 'swap',
  Jetton = 'jetton',
  NFT = 'nft',
}

export interface BatteryState {
  isLoading: boolean;
  balance?: string;
  supportedTransactions: Record<BatterySupportedTransaction, boolean>;
}

export class BatteryManager {
  public state = new State<BatteryState>({
    isLoading: false,
    balance: undefined,
    supportedTransactions: {
      [BatterySupportedTransaction.Swap]: true,
      [BatterySupportedTransaction.Jetton]: true,
      [BatterySupportedTransaction.NFT]: true,
    },
  });

  private logger: NamespacedLogger;

  constructor(
    private persistPath: string,
    private tonProof: TonProofManager,
    private batteryapi: BatteryAPI,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({ balance, supportedTransactions }) => ({
        balance,
        supportedTransactions,
      }),
      storage: this.storage,
      key: `${this.persistPath}/battery`,
    });
    this.logger = logger.extend('BatteryManager');
  }

  public async fetchBalance() {
    try {
      if (!this.tonProof.tonProofToken) {
        throw new Error('No proof token');
      }
      this.state.set({ isLoading: true });
      const data = await this.batteryapi.getBalance(
        { units: UnitsEnum.Ton },
        {
          headers: {
            'X-TonConnect-Auth': this.tonProof.tonProofToken,
          },
        },
      );
      this.state.set({ isLoading: false, balance: data.balance });
    } catch (err) {
      this.state.set({ isLoading: false });
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
      this.logger.error(err);
    }
  }

  public async setSupportedTransaction(
    transaction: BatterySupportedTransaction,
    supported: boolean,
  ) {
    this.state.set((state) => ({
      ...state,
      supportedTransactions: {
        ...state.supportedTransactions,
        [transaction]: supported,
      },
    }));
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

  public async getStatus() {
    try {
      if (!this.tonProof.tonProofToken) {
        throw new Error('No proof token');
      }

      const data = await this.batteryapi.getStatus({
        headers: {
          'X-TonConnect-Auth': this.tonProof.tonProofToken,
        },
      });

      return data.pending_transactions;
    } catch (err) {
      logger.error('getStatus error');
      return [];
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
