import { WalletCurrency } from '../../utils/AmountFormatter/FiatCurrencyConfig';
import { PriceTrend, TokenPrice } from './TokenPriceMoceTypes';

export class TokenPriceModel {
  static createPrice(price: any, currency: WalletCurrency): TokenPrice {
    const percent = price.diff_24h[currency];
    const value = price.prices[currency];

    return {
      diff_24h: { percent, trend: this.defineTrend(percent) },
      value,
    };
  }

  static defineTrend(percent: string) {
    if (percent.startsWith('+')) {
      return PriceTrend.Positive;
    } else if (percent.startsWith('-')) {
      return PriceTrend.Negative;
    }

    return PriceTrend.Unknown;
  }
}
