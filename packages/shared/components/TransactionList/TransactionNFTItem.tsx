import { useNftItemByAddress } from '@tonkeeper/core/src/query/useNftItemByAddress';
import { NftItem } from '@tonkeeper/core/src/TonAPI';
import { View, StyleSheet } from 'react-native';
import { memo } from 'react';

interface TransactionNFTItemProps {
  nftAddress?: string;
  nftItem?: NftItem;
}

export const TransactionNFTItem = memo<TransactionNFTItemProps>((props) => {
  const { data, error } = useNftItemByAddress(props.nftAddress, {
    existingNft: props.nftItem,
  });

  if (data) {
    return <View style={styles.container}></View>;
  } else if (error) {
    console.log('ERROR', error);
  }

  return null;
});

const styles = StyleSheet.create({
  container: {},
});
