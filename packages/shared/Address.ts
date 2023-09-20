import { WalletNetwork } from '@tonkeeper/core';
import { AddressFormatter } from '@tonkeeper/core/src/formatters/Address';
import { tk } from './tonkeeper';

export const Address = new AddressFormatter({
  testOnly: () => tk.wallet?.state.getSnapshot().network === WalletNetwork.testnet,
});
