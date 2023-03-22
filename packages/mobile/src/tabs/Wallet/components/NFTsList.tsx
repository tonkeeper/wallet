import React, { memo, useMemo } from 'react';
import { View } from "$uikit";
import { NFTCardItem } from "../NFTCardItem";
import { Steezy } from '$styles';
import { useWindowDimensions } from 'react-native';

interface NFTsListProps {
  nfts: any; // TODO: add types
}

const mockupCardSize = {
  width: 114,
  height: 166
};

const numColumn = 3;
const indent = 8;
const heightRatio = mockupCardSize.height / mockupCardSize.width;

export const NFTsList = memo<NFTsListProps>(({ nfts }) => {
  const dimensions = useWindowDimensions();

  const size = useMemo(() => {
    const width = (dimensions.width / numColumn) - indent;
    const height = width * heightRatio;

    return { width, height };
  }, [dimensions.width]);

  return (
    <View style={[styles.nftElements, { marginHorizontal: 12 }]}>
      {nfts.map((item, key) => (
        <View style={size} key={key}>
          <NFTCardItem item={item} />
        </View>
      ))}
    </View> 
  );
});

const styles = Steezy.create({
  nftElements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  }
});
