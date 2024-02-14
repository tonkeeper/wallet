import { store } from '$store';
import { mainActions } from '$store/main';
import { walletActions } from '$store/wallet';
import { tk } from '$wallet';
import { Address } from '@tonkeeper/core';
import { TonWallet, Vault, Wallet } from '$blockchain';
import { config } from '$config';
import BigNumber from 'bignumber.js';

export const startApp = async () => {
  BigNumber.config({ EXPONENTIAL_AT: 1e9 });

  await config.load();

  tk.onChangeWallet(() => {
    if (tk.wallet) {
      const vault = Vault.fromJSON({
        name: tk.wallet.identifier,
        tonPubkey: tk.wallet.pubkey,
        version: tk.wallet.config.version,
        workchain: tk.wallet.config.workchain,
        configPubKey: tk.wallet.config.configPubKey,
        allowedDestinations: tk.wallet.config.allowedDestinations,
      });
      const ton = TonWallet.fromJSON(null, vault);

      const wallet = new Wallet(tk.wallet.identifier, vault, ton);

      store.dispatch(
        walletActions.setAddress({
          ton: Address.parse(tk.wallet.address.ton.raw).toFriendly({ bounceable: true }),
        }),
      );
      store.dispatch(walletActions.setWallet(wallet));

      if (!tk.walletForUnlock) {
        store.dispatch(mainActions.setUnlocked(true));
      }
    } else {
      store.dispatch(walletActions.setAddress({}));
      store.dispatch(walletActions.setWallet(null));
    }
  });

  store.dispatch(mainActions.init());
};
