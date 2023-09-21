import { Steezy, Icon, Pressable, View, Picture, Text } from '@tonkeeper/uikit';
import { memo, useCallback, useMemo } from 'react';
import { Address } from '@tonkeeper/shared/Address';
import { t } from '@tonkeeper/shared/i18n';
import { NftItem } from '@tonkeeper/core';

// import { checkIsTonDiamondsNFT } from '$utils';
// import { useExpiringDomains } from '$store/zustand/domains/useExpiringDomains';
// import { AnimationDirection, HideableAmount } from '$core/HideableAmount/HideableAmount';
// import { HideableImage } from '$core/HideableAmount/HideableImage';

interface NftItemCardProps {
  nftItem: NftItem;
}

export const NftItemCard = memo<NftItemCardProps>((props) => {
  const { nftItem } = props;

  // const expiringDomains = useExpiringDomains((state) => state.domains);
  // const isTonDiamondsNft = checkIsTonDiamondsNFT(item);

  const handleOpenNftItem = useCallback(
    () => {},
    // _.throttle(() => openNFT({ currency: item.currency, address: item.address }), 1000),
    [nftItem],
  );

  const isExpiringDomain = false; //expiringDomains[nftRawAddress];
  const isDiamond = false;
  const isHiddenAmounts = false;

  return (
    <Pressable
      // underlayColor={DarkTheme.backgroundContentTint}
      // backgroundColor={DarkTheme.backgroundContent}
      style={styles.container}
      onPress={handleOpenNftItem}
    >
      {isHiddenAmounts ? (
        <Picture preview={nftItem.image.preview} style={styles.picture} />
      ) : (
        <View>
          <Picture
            preview={nftItem.image.preview}
            uri={nftItem.image.medium}
            style={styles.picture}
          />
          <View style={styles.badges}>
            {nftItem.sale && <Icon name="ic-sale-badge-32" colorless />}
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
        <Text type="label2" numberOfLines={1}>
          {nftItem.name}
        </Text>
        <Text type="body3" color="textSecondary" numberOfLines={1}>
          {nftItem.collection?.name || t('nft_single_nft')}
        </Text>

        {/* <HideableAmount
          animationDirection={AnimationDirection.Left}
          stars="* * * *"
          
        >
         
        </HideableAmount>
        <HideableAmount
          animationDirection={AnimationDirection.Left}
         
        >
          {isDNS
            ? 'TON DNS'
            : item?.collection
            ? item.collection.name || t('nft_unnamed_collection')
            : t('nft_single_nft')}
        </HideableAmount> */}
      </View>
    </Pressable>
  );
});

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
  blur: {
    zIndex: 3,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 50,
  },
  picture: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: colors.backgroundContentTint,
  },

  badges: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },

  appearanceBadge: {
    width: 32,
    height: 32,
    borderRadius: 32 / 2,
    backgroundColor: colors.backgroundContent,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

// export const OnSaleBadge = styled.View`
//   position: absolute;
//   top: ${0}px;
//   right: ${0}px;
//   flex-direction: row;
//   align-items: center;
// `;

// export const Badges = styled.View`
//   position: absolute;
//   bottom: ${8}px;
//   right: ${8}px;
//   flex-direction: row;
//   align-items: center;
// `;

// export const FireBadge = styled.View`
//   position: absolute;
//   bottom: ${0}px;
//   right: ${0}px;
//   flex-direction: row;
//   align-items: center;
// `;
