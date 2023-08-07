import { GetNftItemsByOwnerParams } from '../TonAPI/TonAPIGenerated';
import { useQuery, useQueryClient } from 'react-query';
import { useTonAPI } from '../TonAPI';

export const useNftItemsByOwnerQuery = (params: GetNftItemsByOwnerParams) => {
  const queryClient = useQueryClient();
  const tonapi = useTonAPI();

  return useQuery({
    queryKey: ['nfts'],
    queryFn: async () => {
      const { data, error } = await tonapi.accounts.getNftItemsByOwner(params);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      data.nft_items.map((nft) => {
        queryClient.setQueryData(['nfts', nft.address], nft);
      });
    },
  });
};
