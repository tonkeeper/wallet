import { store } from '$store';
import { mainActions } from '$store/main';
import { walletActions } from '$store/wallet';
import { tk } from '$wallet';
import { Address } from '@tonkeeper/core';
import { createLegacyWallet } from '$blockchain';
import { config } from '$config';
import BigNumber from 'bignumber.js';

export const startApp = async () => {
  BigNumber.config({ EXPONENTIAL_AT: 1e9 });

  await config.load();

  tk.onChangeWallet(() => {
    if (tk.wallet) {
      const legacyWallet = createLegacyWallet(tk.wallet);

      store.dispatch(
        walletActions.setAddress({
          ton: Address.parse(tk.wallet.address.ton.raw).toFriendly({
            bounceable: true,
            testOnly: tk.wallet.isTestnet,
          }),
        }),
      );
      store.dispatch(walletActions.setWallet(legacyWallet));

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
