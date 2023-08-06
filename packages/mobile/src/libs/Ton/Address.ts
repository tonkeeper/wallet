import TonWeb from 'tonweb';
import { debugLog } from '$utils/debugLog';
import { Address } from '@tonkeeper/core';

export interface AddressFormatOptions {
  raw?: boolean;
  bounce?: boolean;
  cut?: boolean;
}
export class DeprecatedAddress extends TonWeb.Address {
  format(opts: AddressFormatOptions = {}) {
    const { bounce = true, cut, raw } = opts;

    if (raw) {
      return this.toString(false);
    }

    try {
      const addr = this.toString(true, true, bounce);

      if (cut) {
        return Address.toShort(addr);
      }

      return addr;
    } catch (err) {
      debugLog('[formatAddress]', this.wc, err);
      return '';
    }
  }
}
