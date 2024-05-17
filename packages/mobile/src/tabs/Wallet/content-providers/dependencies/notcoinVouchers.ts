import { DependencyPrototype } from './utils/prototype';

import { NftItem } from '@tonkeeper/core/src/TonAPI';
import { Wallet } from '$wallet/Wallet';
import { NftsState } from '$wallet/managers/NftsManager';
import { Address } from '@tonkeeper/core';
import { config } from '$config';

export class NotCoinVouchersDependency extends DependencyPrototype<NftsState, NftItem[]> {
  constructor(wallet: Wallet) {
    super(wallet.nfts.state, (state) => {
      const nfts = Object.values(state.accountNfts).filter(
        (nft) =>
          nft.collection &&
          !nft.sale &&
          Address.compare(nft.collection.address, config.get('notcoin_nft_collection')),
      );

      return nfts;
    });
  }
}
