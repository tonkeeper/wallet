import { useQuery } from 'react-query';
import { useTonAPI } from '../TonAPI';
import { NftItem } from '../TonAPI/TonAPIGenerated';

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
    cacheTime: Infinity,
    queryFn: async () => {
      if (options.existingNft) {
        return options.existingNft;
      } else {
        const { data, error } = await tonapi.nfts.getNftItemByAddress(nftAddress!);

        if (error) {
          throw error;
        }

        return data;
      }
    },
  });
};
