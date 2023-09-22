import { RawNftItem } from '@tonkeeper/core/src/TonAPI';
import { NftItem, NftModel } from '@tonkeeper/core';
import { useEffect, useState } from 'react';
import { tk } from '../../tonkeeper';

export const useNftItem = (nftAddress?: string, rawNftItem?: RawNftItem) => {
  const [nft, setNft] = useState<NftItem | null>(null);

  useEffect(() => {
    if (rawNftItem) {
      setNft(NftModel.createItem(rawNftItem));
    } else if (nftAddress) {
      const item = tk.wallet.nfts.getLoadedItem(nftAddress);
      if (item) {
        setNft(item);
      } else {
        tk.wallet.nfts
          .loadItem(nftAddress)
          .then((item) => {
            setNft(item);
          })
          .catch((err) => {
            console.log('[Error load nft item]', err);
          });
      }
    }
  }, [nftAddress]);

  return nft;
};