import { AddressFormatter } from '@tonkeeper/core/src/formatters/Address';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { WalletNetwork } from '@tonkeeper/mobile/src/wallet/WalletTypes';

export const Address = new AddressFormatter({
  testOnly: () => tk.wallet?.config.network === WalletNetwork.testnet,
});
