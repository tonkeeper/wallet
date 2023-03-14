import React, { memo } from 'react';
import { View } from "$uikit";
import { NFTCardItem } from "../NFTCardItem";
import { Steezy } from '$styles';

interface NFTsListProps {
  nfts: any; // TODO: add types
}

export const NFTsList = memo<NFTsListProps>(({ nfts }) => {
  return (
    <View style={styles.nftElements}>
      {nfts.map((item, key) => (
        <NFTCardItem
          item={item}
          key={key}
        />
      ))}
    </View> 
  );
});

const styles = Steezy.create({
  nftElements: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12
  }
});
