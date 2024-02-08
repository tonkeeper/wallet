import { NftItem } from '@tonkeeper/core/src/TonAPI/TonAPIGenerated';
import { useQuery } from 'react-query';
import { tk } from '@tonkeeper/mobile/src/wallet';

type UseNftItemByAddressOptions = {
  existingNft?: NftItem;
};

export const useNftItemByAddress = (
  nftAddress?: string,
  options: UseNftItemByAddressOptions = {},
) => {
  const cacheKey = nftAddress ?? options.existingNft?.address;

  return useQuery({
    enabled: !!cacheKey,
    queryKey: ['nfts', cacheKey],
    initialData: options.existingNft
      ? tk.wallet.nfts.makeCustomNftItem(options.existingNft)
      : undefined,
    cacheTime: Infinity,
    queryFn: async () => {
      if (options.existingNft) {
        return tk.wallet.nfts.getCachedByAddress(
          options.existingNft.address,
          options.existingNft,
        );
      } else {
        return tk.wallet.nfts.fetchByAddress(nftAddress!);
      }
    },
  });
};
