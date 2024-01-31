import { useNftItemByAddress } from '../../query/hooks/useNftItemByAddress';
import { Steezy, View, Text, Icon, Picture, ListItemContent } from '@tonkeeper/uikit';
import { NftItem } from '@tonkeeper/core/src/TonAPI';
import { Pressable } from 'react-native';
import { memo, useCallback } from 'react';
import { t } from '../../i18n';

import { openNftModal } from '@tonkeeper/mobile/src/core/NFT/NFT';
import {
  AnimationDirection,
  HideableAmount,
} from '@tonkeeper/mobile/src/core/HideableAmount/HideableAmount';
import { HideableImage } from '@tonkeeper/mobile/src/core/HideableAmount/HideableImage';
import { useHideableAmount } from '@tonkeeper/mobile/src/core/HideableAmount/HideableAmountProvider';
import Animated, { useAnimatedStyle, interpolate } from 'react-native-reanimated';

interface NftPreviewContentProps {
  nftAddress?: string;
  nftItem?: NftItem;
  disabled?: boolean;
}

export const NftPreviewContent = memo<NftPreviewContentProps>((props) => {
  const { nftAddress, nftItem, disabled } = props;
  const { data: nft } = useNftItemByAddress(props.nftAddress, {
    existingNft: nftItem,
  });

  const hideableAnimProgress = useHideableAmount();

  const hideableAnimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(hideableAnimProgress.value, [0, 1], [1, 0]),
  }));

  const handlePress = useCallback(() => {
    const address = nftAddress ?? nftItem?.address;
    if (address) {
      openNftModal(address);
    }
  }, [nftAddress, nftItem?.address]);

  if (nft) {
    return (
      <Pressable
        disabled={props.disabled}
        onPress={handlePress}
        style={styles.container.static}
      >
        <ListItemContent style={styles.item.static}>
          <View style={styles.pictureContainer}>
            <HideableImage
              imageStyle={styles.picture}
              image={
                <Picture
                  preview={nft.image?.preview}
                  uri={nft.image?.small}
                  style={styles.picture}
                />
              }
            />
          </View>
          <View style={styles.infoContainer}>
            <HideableAmount
              animationDirection={AnimationDirection.Left}
              stars="* * * *"
              variant="body2"
              numberOfLines={1}
            >
              {nft.name}
            </HideableAmount>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <HideableAmount
                animationDirection={AnimationDirection.Left}
                variant="body2"
                color="textSecondary"
                numberOfLines={1}
              >
                {nft.collection?.name || t('nft_single_nft')}
              </HideableAmount>
              {nft.approved_by?.length > 0 && (
                <Animated.View
                  style={[styles.verificationIcon.static, hideableAnimStyle]}
                >
                  <Icon name="ic-verification-secondary-16" color="iconSecondary" />
                </Animated.View>
              )}
            </View>
          </View>
        </ListItemContent>
      </Pressable>
    );
  }

  return (
    <ListItemContent style={styles.item.static}>
      <View style={styles.pictureContainer} />
      <View style={styles.infoContainer} />
    </ListItemContent>
  );
});

const styles = Steezy.create(({ colors, corners }) => ({
  container: {
    alignItems: 'flex-start',
    minWidth: 180,
  },
  item: {
    flexDirection: 'row',
    marginTop: 8,
    height: 64,
    borderRadius: 12,
  },
  skeleton: {
    width: 230,
  },
  pictureContainer: {
    backgroundColor: colors.backgroundContentAttention,
    borderBottomLeftRadius: corners.small,
    borderTopLeftRadius: corners.small,
    width: 64,
    height: 64,
  },
  picture: {
    width: 64,
    height: 64,
    borderBottomLeftRadius: corners.small,
    borderTopLeftRadius: corners.small,
  },
  infoContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
    flexShrink: 1,
  },
  verificationIcon: {
    marginLeft: 4,
  },
}));
