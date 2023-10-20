import { AddressFormatter } from '@tonkeeper/core/src/formatters/Address';
import { WalletNetwork } from '@tonkeeper/core';
import { tk } from './tonkeeper';

export const Address = new AddressFormatter({
  testOnly: () => tk.wallet?.state.getSnapshot().network === WalletNetwork.testnet,
});
