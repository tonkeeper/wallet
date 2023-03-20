import React, { memo, useMemo } from 'react';
import { View } from "$uikit";
import { NFTCardItem } from "../NFTCardItem";
import { Steezy } from '$styles';
import { useWindowDimensions } from 'react-native';
import { ns } from '$utils';

interface NFTsListProps {
  nfts: any; // TODO: add types
  screenWidth: number;
}

const mockupCardSize = {
  width: ns(114),
  height: ns(166)
};

const numColumn = 3;
const indent = ns(8);
const heightRatio = mockupCardSize.height / mockupCardSize.width;

export const NFTsList = memo<NFTsListProps>(({ nfts }) => {
  const dimensions = useWindowDimensions();

  const size = useMemo(() => {
    const width = (dimensions.width / numColumn) - indent;
    const height = width * heightRatio;

    return { width, height };
  }, [dimensions.width]);


  return (
    <View style={styles.nftElements}>
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
    // marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12 
  }
});
