import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { network } from '@tonkeeper/core';
import { useQuery, useQueryClient } from 'react-query';

type GetNftByAddressParams = {
  account_id: string;
  address: string;
};

const getNftByAddress = async (params: GetNftByAddressParams) => {
  const { data } = await network.get(`/v2/nft/${params.account_id}`, {
    params: {
      address: params.account_id,
    },
  });

  return data;
};

type UseNFTQueryParams = {
  account_id: string;
  address: string;
};

const useNFTQuery = (params: UseNFTQueryParams) => {
  const queryClient = useQueryClient();
  const { data: post } = useQuery(['nfts', params.address], () =>
    getNftByAddress(params),
  );

  return {
    post,
  };
};

const useNFTsQuery = () => {
  const queryClient = useQueryClient();
  const { data: nfts } = useQuery(['nfts'], () => {}, {
    onSuccess: (data) => {
      data?.data.map((nft: any) => {
        queryClient.setQueryData(['nfts', nft.address], nft);
      });
    },
  });
};

interface TransactionNFTItemProps {
  nftAddress?: string;
  nft: any;
}

export const TransactionNFTItem = memo<TransactionNFTItemProps>((props) => {
  const { nft } = props;
  // const nft = useNFTQuery({
  //   params: { address:  }
  // });

  if (nft) {
    return (
      <View style={styles.container}>
  
      </View>
    );
  }
  
  return null;
});

const styles = StyleSheet.create({
  container: {},
});
