import TonWeb from 'tonweb';
import { debugLog, maskifyAddress } from '$utils';

export interface AddressFormatOptions {
  bounce?: boolean;
  cut?: boolean;
}
export class Address extends TonWeb.Address {
  format(opts: AddressFormatOptions = {}) {
    const { bounce = true, cut } = opts;

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
