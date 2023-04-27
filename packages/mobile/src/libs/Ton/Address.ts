import TonWeb from 'tonweb';
import { debugLog, maskifyAddress } from '$utils';

export interface AddressFormatOptions {
  raw?: boolean;
  bounce?: boolean;
  cut?: boolean;
}
export class Address extends TonWeb.Address {
  format(opts: AddressFormatOptions = {}) {
    const { bounce = true, cut, raw } = opts;

    if (raw) {
      return this.toString(false);
    }

    try {
      const addr = this.toString(true, true, bounce);

      if (cut) {
        return maskifyAddress(addr);
      }

      return addr;
    } catch (err) {
      debugLog('[formatAddress]', this.wc, err);
      return '';
    }
  }
}
