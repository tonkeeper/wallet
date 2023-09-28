import { WalletNetwork } from '@tonkeeper/core/src/Wallet';
import { AddressFormatter } from '@tonkeeper/core/src/formatters/Address';
import { tk } from './tonkeeper';

export const Address = new AddressFormatter({
  testOnly: () => tk.wallet?.identity.network === WalletNetwork.testnet,
});
