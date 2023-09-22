import { Steezy, Icon, Pressable, View, Picture, useTheme } from '@tonkeeper/uikit';
import { AnimationDirection, HideableText } from '../HideableText';
import { memo, useCallback, useMemo } from 'react';
import { t } from '@tonkeeper/shared/i18n';
import { NftItem } from '@tonkeeper/core';

// TODO: move
import { usePrivacyStore } from '@tonkeeper/mobile/src/store/zustand/privacy/usePrivacyStore';
import { openNftModal } from '@tonkeeper/mobile/src/core/NFT/NFT';
import { useWindowDimensions } from 'react-native';
// import { checkIsTonDiamondsNFT } from '$utils';
// import { useExpiringDomains } from '$store/zustand/domains/useExpiringDomains';

interface NftItemCardProps {
  numColumn?: number;
  nftItem: NftItem;
}

export const NftItemCard = memo<NftItemCardProps>((props) => {
  const { nftItem, numColumn = 3 } = props;
  const dimensions = useWindowDimensions();
  const theme = useTheme();
  const isHiddenAmounts = usePrivacyStore((state) => state.hiddenAmounts);

  // const expiringDomains = useExpiringDomains((state) => state.domains);
  // const isTonDiamondsNft = checkIsTonDiamondsNFT(item);

  const handleOpenNftItem = useCallback(() => {
    openNftModal(nftItem.address);
  }, [nftItem]);

  const isExpiringDomain = false; //expiringDomains[nftRawAddress];
  const isDiamond = false;

  const size = useMemo(() => {
    const width = dimensions.width / numColumn - CardIndent;
    const height = width * (BaseCardSize.height / BaseCardSize.width);

    return { width, height };
  }, [dimensions.width, numColumn]);

  return (
    <View style={size}>
      <Pressable
        underlayColor={theme.backgroundContentTint}
        backgroundColor={theme.backgroundContent}
        onPress={handleOpenNftItem}
        style={styles.container}
      >
        {isHiddenAmounts ? (
          <View style={styles.pictureContainer}>
            <Picture preview={nftItem.image.preview} style={styles.picture} />
          </View>
        ) : (
          <View style={styles.pictureContainer}>
            <Picture
              preview={nftItem.image.preview}
              uri={nftItem.image.small}
              style={styles.picture}
            />
            <View style={styles.topBadges}>
              {nftItem.sale && <Icon name="ic-sale-badge-32" colorless />}
            </View>
            <View style={styles.bottomBadges}>
              {isDiamond && (
                <View style={styles.appearanceBadge}>
                  <Icon name="ic-appearance-16" color="constantWhite" />
                </View>
              )}
              {isExpiringDomain && <Icon name="ic-fire-badge-32" colorless />}
            </View>
          </View>
        )}
        <View style={styles.info}>
          <HideableText
            animationDirection={AnimationDirection.Left}
            numberOfLines={1}
            type="label2"
            numStars={4}
          >
            {nftItem.name}
          </HideableText>
          <HideableText
            animationDirection={AnimationDirection.Left}
            color="textSecondary"
            numberOfLines={1}
            type="body3"
          >
            {nftItem.collection?.name || t('nft_single_nft')}
          </HideableText>
        </View>
      </Pressable>
    </View>
  );
});

const CardIndent = 8;
const BaseCardSize = { width: 114, height: 166 };

const styles = Steezy.create(({ colors, corners }) => ({
  container: {
    position: 'relative',
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 8,
    backgroundColor: colors.backgroundContent,
    borderRadius: corners.medium,
    overflow: 'hidden',
  },
  info: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pictureContainer: {
    flex: 1,
  },
  picture: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: colors.backgroundContentTint,
  },
  topBadges: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    top: 0,
    right: 0,
  },
  bottomBadges: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    bottom: 0,
    right: 0,
  },
  appearanceBadge: {
    width: 32,
    height: 32,
    borderRadius: 32 / 2,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.backgroundContent,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
