import { View, Steezy } from '@tonkeeper/uikit';
import { NftItemCard } from './NftItemCard';
import { NftItem } from '@tonkeeper/core';
import { memo } from 'react';

interface NftItemCardsRowProps {
  nftItems: NftItem[];
}

export const NftItemCardsRow = memo<NftItemCardsRowProps>((props) => {
  const { nftItems } = props;

  return (
    <View style={styles.container}>
      {nftItems.map((item, key) => (
        <NftItemCard key={key} nftItem={item} numColumn={nftItems.length} />
      ))}
    </View>
  );
});

const styles = Steezy.create({
  container: {
    marginHorizontal: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
