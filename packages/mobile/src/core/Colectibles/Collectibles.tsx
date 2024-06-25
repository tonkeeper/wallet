import React, { memo, useMemo } from 'react';
import { View } from '$uikit';
import { NFTCardItem } from './NFTCardItem';
import { Steezy } from '$styles';
import { useWindowDimensions } from 'react-native';
import { useApprovedNfts } from '$hooks/useApprovedNfts';
import { Icon, Screen, TouchableOpacity } from '@tonkeeper/uikit';
import { t } from '@tonkeeper/shared/i18n';
import { useTokenApproval } from '@tonkeeper/shared/hooks';
import { openManageTokens } from '$navigation';

const mockupCardSize = {
  width: 114,
  height: 166,
};

const numColumn = 3;
const heightRatio = mockupCardSize.height / mockupCardSize.width;

export const Collectibles = memo(() => {
  const nfts = useApprovedNfts();
  const dimensions = useWindowDimensions();
  const approvalStatuses = useTokenApproval((state) => state.tokens);

  const size = useMemo(() => {
    const width = (dimensions.width - 48) / numColumn;
    const height = width * heightRatio;

    return { width, height };
  }, [dimensions.width]);

  return (
    <Screen>
      <Screen.LargeHeader
        rightContent={
          <TouchableOpacity
            onPress={() => openManageTokens('collectibles')}
            activeOpacity={0.24}
            style={styles.rightNavButton}
          >
            <Icon color="iconPrimary" name={'ic-sliders-16'} />
          </TouchableOpacity>
        }
        title={t('tab_collectibles')}
      />
      <Screen.FlashList
        contentContainerStyle={styles.collectiblesContainer.static}
        data={nfts.enabled}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper.static}
        renderItem={({ item }) => (
          <View style={size}>
            <NFTCardItem approvalStatuses={approvalStatuses} item={item} />
          </View>
        )}
      />
    </Screen>
  );
});

const styles = Steezy.create(({ colors }) => ({
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
  rightNavButton: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: colors.buttonSecondaryBackground,
  },
}));
