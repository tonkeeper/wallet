import { WalletCurrency } from '@tonkeeper/core/src/utils/AmountFormatter/FiatCurrencyConfig';
import { Storage } from '@tonkeeper/core/src/declarations/Storage';
import { State } from '@tonkeeper/core/src/utils/State';
import { TonAPI } from '@tonkeeper/core/src/TonAPI';
import { TokenRate } from '../WalletTypes';
import { NamespacedLogger, logger } from '$logger';

export type PricesState = {
  ton: TokenRate;
  updatedAt: number;
  currency: WalletCurrency;
};

export class TonPriceManager {
  public state = new State<PricesState>({
    ton: {
      fiat: 0,
      usd: 0,
      ton: 0,
      diff_24h: '',
    },
    updatedAt: Date.now(),
    currency: WalletCurrency.USD,
  });

  private logger: NamespacedLogger;

  constructor(private tonapi: TonAPI, private storage: Storage) {
    this.state.persist({
      storage: this.storage,
      key: 'ton_price',
    });

    this.logger = logger.extend('TonPriceManager');

    this.migrate();
  }

  setFiatCurrency(currency: WalletCurrency) {
    this.logger.debug('Setting fiat currency', currency);
    this.state.clear();
    this.state.clearPersist();
    this.state.set({ currency });
  }

  public async load() {
    this.logger.debug('Loading TON price');
    try {
      const currency = this.state.data.currency.toUpperCase();
      const token = 'TON';
      const data = await this.tonapi.rates.getRates({
        currencies: ['TON', 'USD', currency].join(','),
        tokens: token,
      });

      this.state.set({
        ton: {
          fiat: data.rates[token].prices![currency],
          usd: data.rates[token].prices!.USD,
          ton: data.rates[token].prices!.TON,
          diff_24h: data.rates[token].diff_24h![currency],
        },
        updatedAt: Date.now(),
      });
    } catch {}
  }

  private async migrate() {
    try {
      const key = 'mainnet_default_primary_currency';
      const currency = (await this.storage.getItem(key)) as WalletCurrency;

      if (currency) {
        this.storage.removeItem(key);
        this.state.set({ currency });
      }
    } catch {}
  }

  public async rehydrate() {
    return this.state.rehydrate();
  }
}
