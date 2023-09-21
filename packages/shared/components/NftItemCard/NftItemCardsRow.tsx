import { useWindowDimensions } from 'react-native';
import { View, Steezy } from '@tonkeeper/uikit';
import { NftItemCard } from './NftItemCard';
import { NftItem } from '@tonkeeper/core';
import { memo, useMemo } from 'react';

interface NftItemCardsRowProps {
  nftItems: NftItem[];
}

export const NftItemCardsRow = memo<NftItemCardsRowProps>((props) => {
  const { nftItems } = props;
  const dimensions = useWindowDimensions();

  const size = useMemo(() => {
    const width = dimensions.width / nftItems.length - itemIndent;
    const height = width * (baseCardSize.height / baseCardSize.width);

    return { width, height };
  }, [dimensions.width]);

  return (
    <View style={styles.container}>
      {nftItems.map((item, key) => (
        <View style={size} key={key}>
          <NftItemCard nftItem={item} />
        </View>
      ))}
    </View>
  );
});

const itemIndent = 8;
const baseCardSize = { width: 114, height: 166 };

const styles = Steezy.create({
  container: {
    marginHorizontal: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
