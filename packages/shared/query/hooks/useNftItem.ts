import { NftItem } from '@tonkeeper/core/src/TonAPI';
import { useEffect, useState } from 'react';
import { tk } from '../../tonkeeper';
import { NftModel } from '@tonkeeper/core/src/models/NftModel';

export const useNftItem = (nftAddress?: string, nftItem?: NftItem) => {
  const [nft, setNft] = useState<any>(null);

  useEffect(() => {
    if (nftItem) {
      setNft(NftModel.createItem(nftItem));
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
