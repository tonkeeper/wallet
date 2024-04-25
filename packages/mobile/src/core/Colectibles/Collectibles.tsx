import React, { memo, useMemo } from 'react';
import { View } from '$uikit';
import { NFTCardItem } from './NFTCardItem';
import { Steezy } from '$styles';
import { useWindowDimensions } from 'react-native';
import { useApprovedNfts } from '$hooks/useApprovedNfts';
import { Screen } from '@tonkeeper/uikit';
import { t } from '@tonkeeper/shared/i18n';

const mockupCardSize = {
  width: 114,
  height: 166,
};

const numColumn = 3;
const heightRatio = mockupCardSize.height / mockupCardSize.width;

export const Collectibles = memo(() => {
  const nfts = useApprovedNfts();
  const dimensions = useWindowDimensions();

  const size = useMemo(() => {
    const width = (dimensions.width - 48) / numColumn;
    const height = width * heightRatio;

    return { width, height };
  }, [dimensions.width]);

  return (
    <Screen>
      <Screen.LargeHeader title={t('tab_collectibles')} />
      <Screen.FlashList
        contentContainerStyle={styles.collectiblesContainer.static}
        data={nfts.enabled}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper.static}
        renderItem={({ item }) => (
          <View style={size}>
            <NFTCardItem item={item} />
          </View>
        )}
      />
    </Screen>
  );
});

const styles = Steezy.create({
  collectiblesContainer: {
    marginHorizontal: 16,
    gap: 8,
  },
  nftElements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  columnWrapper: {
    gap: 8,
  },
});
