import { NftItem } from '../TonAPI/TonAPIGenerated';
import { useQuery } from 'react-query';
import { useTonAPI } from '../TonAPI';

type UseNftItemByAddressOptions = {
  existingNft?: NftItem;
};

export const useNftItemByAddress = (
  nftAddress?: string,
  options: UseNftItemByAddressOptions = {},
) => {
  const tonapi = useTonAPI();
  const cacheKey = nftAddress ?? options.existingNft?.address;

  return useQuery({
    enabled: !!cacheKey,
    queryKey: ['nfts', cacheKey],
    initialData: options.existingNft,
    cacheTime: Infinity,
    queryFn: async () => {
      if (options.existingNft) {
        return options.existingNft;
      } else {
        return await tonapi.nfts.getNftItemByAddress(nftAddress!);
      }
    },
  });
};
