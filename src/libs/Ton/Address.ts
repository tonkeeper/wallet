import TonWeb from 'tonweb';
import { debugLog, maskifyAddress } from '$utils';

export class Address extends TonWeb.Address {
  format(
    opts: {
      bounce?: boolean;
      cut?: boolean;
    } = {},
  ) {
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
