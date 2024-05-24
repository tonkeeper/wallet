import { Steezy, View, Text, Icon, Picture, ListItemContent } from '@tonkeeper/uikit';
import { TrustType } from '@tonkeeper/core/src/TonAPI';
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
import { Address } from '../../Address';
import { useTokenApproval } from '../../hooks';
import { TokenApprovalStatus } from '@tonkeeper/mobile/src/wallet/managers/TokenApprovalManager';

interface NftPreviewContentProps {
  nft: any;
  disabled?: boolean;
}

export const NftPreviewContent = memo<NftPreviewContentProps>((props) => {
  const { nft, disabled } = props;

  const approvalStatuses = useTokenApproval((state) => state.tokens);
  const hideableAnimProgress = useHideableAmount();

  const hideableAnimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(hideableAnimProgress.value, [0, 1], [1, 0]),
  }));

  const handlePress = useCallback(() => {
    const address = nft.address;
    if (address) {
      openNftModal(address);
    }
  }, [nft.address]);

  const approvalIdentifier = Address.parse(
    nft?.collection?.address ?? nft?.address,
  ).toRaw();
  const nftApprovalStatus = approvalStatuses[approvalIdentifier];

  const isDisabled = disabled || nftApprovalStatus?.current === TokenApprovalStatus.Spam;

  return (
    <Pressable
      disabled={isDisabled}
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
            {nft.trust === TrustType.None ? (
              <Text
                numberOfLines={1}
                type="body2"
                color={
                  nftApprovalStatus?.current === TokenApprovalStatus.Approved
                    ? 'textSecondary'
                    : 'accentOrange'
                }
              >
                {t('suspicious.label.full')}
              </Text>
            ) : (
              <HideableAmount
                animationDirection={AnimationDirection.Left}
                variant="body2"
                color="textSecondary"
                numberOfLines={1}
              >
                {nft.collection?.name || t('nft_single_nft')}
              </HideableAmount>
            )}
            {nft.approved_by?.length > 0 && (
              <Animated.View style={[styles.verificationIcon.static, hideableAnimStyle]}>
                <Icon name="ic-verification-secondary-16" color="iconSecondary" />
              </Animated.View>
            )}
          </View>
        </View>
      </ListItemContent>
    </Pressable>
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
