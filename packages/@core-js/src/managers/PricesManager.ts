import { WalletCurrency } from '../utils/AmountFormatter/FiatCurrencyConfig';
import { TokenPrice, TokenPriceModel } from '../models/TokenPriceModel';
import { Storage } from '../declarations/Storage';
import { State } from '../utils/State';
import { TonAPI } from '../TonAPI';

export type PricesState = {
  prices: { [key: string]: TokenPrice };
};

export class PricesManager {
  public state = new State<PricesState>({
    prices: {},
  });

  constructor(
    private currency: WalletCurrency,
    private tonapi: TonAPI,
    private storage: Storage,
  ) {
    this.state.persist({
      partialize: ({ prices }) => ({ prices }),
      storage: this.storage,
      key: 'prices',
    });
  }

  public getLoadedTonPrice() {
    return this.state.data.prices['TON'];
  }

  public async getTonPrice() {
    const loadedPrice = this.getLoadedTonPrice();
    if (!loadedPrice) {
      return this.getPrice('TON');
    }

    return loadedPrice;
  }

  public async getPrice(tokens: string) {
    const data = await this.tonapi.rates.getRates({
      currencies: this.currency,
      tokens,
    });

    const prices = Object.keys(data.rates).reduce((prices, token) => {
      prices[token] = TokenPriceModel.createPrice(data.rates[token], this.currency);
      return prices;
    }, {});

    this.state.set({ prices });
  }

  public async preload() {
    this.getTonPrice();
  }
}
