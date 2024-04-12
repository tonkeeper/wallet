import { FiatCurrencySymbolsConfig } from './FiatCurrencyConfig';
import BigNumber from 'bignumber.js';

type LocaleFormat = {
  groupingSeparator: string;
  decimalSeparator: string;
};

type AmountFormatterOptions = {
  getDefaultDecimals?: (bn: BigNumber) => number;
  getLocaleFormat?: () => LocaleFormat;
};

export type AmountFormatOptions = {
  decimals?: number;
  currency?: string;
  currencySeparator?: 'thin' | 'wide'; // Default thin;
  prefix?: string;
  postfix?: string;
  withoutTruncate?: boolean;
  ignoreZeroTruncate?: boolean;
  absolute?: boolean;
  withPositivePrefix?: boolean;
  // Truncate decimals. Required for backward compatibility
  forceRespectDecimalPlaces?: boolean;
};

export type AmountFormatNanoOptions = AmountFormatOptions & {
  formatDecimals?: number;
};

export type AmountNumber = string | number | BigNumber;

export class AmountFormatter {
  private getDefaultDecimals: (bn: BigNumber) => number;
  private getLocaleFormat: () => LocaleFormat;
  private spaces = {
    thin: ' ',
    wide: ' ',
  };

  static sign = {
    minus: '−',
    plus: '+',
  };

  constructor(options: AmountFormatterOptions) {
    if (options.getDefaultDecimals) {
      this.getDefaultDecimals = options.getDefaultDecimals;
    } else {
      this.getDefaultDecimals = () => 2;
    }

    if (options.getLocaleFormat) {
      this.getLocaleFormat = options.getLocaleFormat;
    } else {
      this.getLocaleFormat = () => ({
        decimalSeparator: '.',
        groupingSeparator: ',',
      });
    }
  }

  public isNegative(amount: AmountNumber) {
    return new BigNumber(amount).isLessThan(0);
  }

  static toNano(amount: number | string, decimals?: number) {
    let bn = new BigNumber(amount ?? 0);
    if (decimals) {
      bn = bn.decimalPlaces(decimals, BigNumber.ROUND_DOWN);
    }
    return bn.shiftedBy(decimals ?? 9).toString(10);
  }

  static fromNanoStatic(amount: AmountNumber, decimals: number = 9) {
    return new BigNumber(amount ?? 0)
      .shiftedBy(-decimals)
      .decimalPlaces(decimals, BigNumber.ROUND_DOWN)
      .toString(10);
  }

  public fromNano(amount: AmountNumber, decimals: number = 9) {
    return AmountFormatter.fromNanoStatic(amount, decimals);
  }

  private toBN(amount: AmountNumber = 0) {
    return BigNumber.isBigNumber(amount) ? amount : new BigNumber(amount);
  }

  public parseFormatted(stringNumber: string) {
    const NUMBER_DIVIDER = ' ';
    const { decimalSeparator, groupingSeparator } = this.getLocaleFormat();
    return stringNumber
      .replace(groupingSeparator, '')
      .replace(new RegExp(`\\${NUMBER_DIVIDER}`, 'g'), '')
      .replace(new RegExp(`\\${decimalSeparator}`), '.');
  }

  public format(amount: AmountNumber = 0, options: AmountFormatOptions = {}) {
    const { withPositivePrefix, currencySeparator = 'thin', absolute = false } = options;
    let bn = this.toBN(amount);

    const decimals = options.decimals ?? this.getDefaultDecimals(bn);
    let prefix = '';
    let suffix = '';

    if (bn.isNegative()) {
      bn = bn.abs();
      if (!absolute) {
        prefix += '− ';
      }
    } else if (withPositivePrefix && !bn.isZero()) {
      prefix += '+ ';
    }

    if (options.currency) {
      const conf = FiatCurrencySymbolsConfig[options.currency];
      if (conf) {
        if (conf.side === 'start') {
          prefix += conf.symbol + this.spaces[currencySeparator];
        } else {
          suffix = this.spaces[currencySeparator] + conf.symbol;
        }
      } else {
        suffix = this.spaces[currencySeparator] + options.currency;
      }
    }

    if (options.postfix) {
      suffix = this.spaces['wide'] + options.postfix;
    }

    if (options.prefix) {
      prefix = options.prefix + this.spaces['thin'];
    }

    const { decimalSeparator, groupingSeparator } = this.getLocaleFormat();
    const formatConf = {
      groupSeparator: groupingSeparator,
      decimalSeparator,
      fractionGroupSize: 2,
      groupSize: 3,
      prefix,
      suffix,
    };

    // truncate decimals 1.00 -> 1
    if (
      options.forceRespectDecimalPlaces ||
      (!options.ignoreZeroTruncate && bn.isLessThan('1000'))
    ) {
      bn = bn.decimalPlaces(decimals, BigNumber.ROUND_DOWN);
      return bn.toFormat(formatConf);
    }

    if (options.withoutTruncate) {
      return bn.toFormat(formatConf);
    }

    return bn.toFormat(2, BigNumber.ROUND_DOWN, formatConf);
  }

  public formatNano(amount: AmountNumber = 0, options: AmountFormatNanoOptions = {}) {
    const { decimals, formatDecimals, ...other } = options;
    const formatOptions = Object.assign(other, { decimals: formatDecimals });
    return this.format(this.fromNano(amount, decimals), formatOptions);
  }
}
