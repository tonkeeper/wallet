import { WalletCurrency } from '../utils/AmountFormatter/FiatCurrencyConfig';
import { JettonBalance, JettonVerificationType, TonAPI } from '../TonAPI';
import { TokenPriceModel } from '../models/TokenPriceModel';
import { Storage } from '../declarations/Storage';
import { TonRawAddress } from '../WalletTypes';
import { Logger } from '../utils/Logger';
import { State } from '../utils/State';

export type JettonsState = {
  items: JettonBalance[];
  error?: string | null;
  isReloading: boolean;
  isLoading: boolean;
};

export class JettonsManager {
  public state = new State<JettonsState>({
    isReloading: false,
    isLoading: false,
    items: [],
    error: null,
  });

  constructor(
    private tonRawAddress: TonRawAddress,
    private currency: WalletCurrency,
    private tonapi: TonAPI,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({ items }) => ({ items }),
      storage: this.storage,
      key: 'jettons1',
    });
  }

  public async load() {
    try {
      this.state.set({ isLoading: true, error: null });

      const accountJettons = await this.tonapi.accounts.getAccountJettonsBalances({
        accountId: this.tonRawAddress,
        currencies: this.currency,
      });

      const items = accountJettons.balances
        .filter((item) => {
          if (item.balance === '0') {
            return false;
          }

          if (item.jetton.verification === JettonVerificationType.Blacklist) {
            return false;
          }

          return true;
        })
        .map((item) => {
          if (!item.price) {
            return item;
          }

          const price = TokenPriceModel.createPrice(item.price, this.currency);

          return {
            ...item,
            price,
          };
        });

      this.state.set({
        isLoading: false,
        items,
      });
    } catch (err) {
      const message = `[JettonsManager]: ${Logger.getErrorMessage(err)}`;
      console.log(message);
      this.state.set({
        isLoading: false,
        error: message,
      });
    }
  }

  public getLoadedJetton(jettonAddress: string) {
    return this.state.data.items.find((item) => item.jetton.address === jettonAddress);
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }

  public async reload() {
    this.state.set({ isReloading: true });
    await this.load();
    this.state.set({ isReloading: false });
  }
}
