import { CollectionModel } from '$store/models';
import { DarkTheme } from '$styles';
import { Steezy } from '$styles';
import { View, Image, Text, TouchableHighlight } from '$uikit';
import React, { memo } from 'react';

type NFTItem = {
  collectionAddress?: string;
  dns?: string;
  verified?: boolean;
  // currency: CryptoCurrency;
  isApproved: boolean;
  internalId: string;
  provider: string;
  address: string;
  ownerAddress: string;
  index: number;
  name: string;
  description?: string;
  marketplaceURL?: string;
  collection?: CollectionModel;
  content: {
    image: {
      baseUrl: string;
    };
  };
  attributes: {
    trait_type: string;
    value: string;
  }[];
  // metadata: MetaData;
  ownerAddressToDisplay?: string;
};

interface NFTCardItemProps {
  item: NFTItem;
  onPress?: () => void;
}

export const NFTCardItem = memo<NFTCardItemProps>((props) => {
  const { item, onPress } = props;

  const imageSource = { uri: item.content?.image?.baseUrl };

  return (
    <TouchableHighlight 
      underlayColor={DarkTheme.backgroundContentTint}
      style={styles.container}
      activeOpacity={1}
      onPress={onPress}
    >
      <View>
        <Image
          source={imageSource}
          style={styles.image} 
        />
        <View style={styles.info}>
          <Text variant="label2" numberOfLines={1}>
            {item.name}
          </Text>
          <Text variant="body3" color="textSecondary" numberOfLines={1}>
            {item.collection?.name}
          </Text>
        </View>
      </View>
    </TouchableHighlight>
  );
});

const styles = Steezy.create(({ colors, corners }) => ({
  container: {
    margin: 4,
    width: 114,
    backgroundColor: colors.backgroundContent,
    borderRadius: corners.medium,
    overflow: 'hidden'
  },
  info: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  image: {
    height: 114
  }
}));