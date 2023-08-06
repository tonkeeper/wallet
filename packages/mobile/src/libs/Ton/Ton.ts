import TonWeb from 'tonweb';
import BN from 'bn.js';
import { Cell } from 'tonweb/dist/types/boc/cell';
import * as mnemonic from './mnemonic';
import { toLocaleNumber } from '$utils/number';

export class Ton {
  static toNano(value: number | string | BN) {
    if (typeof value === 'number') {
      value = value.toString();
    }
    return TonWeb.utils.toNano(value);
  }
  static fromNano(value: number | string | BN) {
    if (typeof value === 'number') {
      value = value.toString();
    }
    return TonWeb.utils.fromNano(value);
  }

  static formatAmount(amount: string | number, currency = 'TON') {
    return `${toLocaleNumber(Ton.fromNano(amount))} ${currency}`;
  }
  static mnemonic = mnemonic;
  static base64ToCell(base64?: string): Cell | undefined {
    if (base64) {
      const bytes = new Uint8Array(Buffer.from(base64, 'base64'));
      return TonWeb.boc.Cell.oneFromBoc(bytes);
    }
  }
}
