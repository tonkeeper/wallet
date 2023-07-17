import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNftItemByAddress } from '@tonkeeper/core/src/query/useNftItemByAddress';

interface TransactionNFTItemProps {
  nftAddress?: string;
  nft: any;
}

export const TransactionNFTItem = memo<TransactionNFTItemProps>((props) => {
  const { data, error } = useNftItemByAddress(props.nftAddress, {
    existingNft: props.nft,
  });

  if (data) {
    return (
      <View style={styles.container}>
  
      </View>
    );
  } else if (error) {
    console.log('ERROR', error);
  }

  return null;
});

const styles = StyleSheet.create({
  container: {},
});
