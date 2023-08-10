import { useNftItemByAddress } from '@tonkeeper/core/src/query/useNftItemByAddress';
import { Steezy, View, Text, Icon } from '@tonkeeper/uikit';
import { NftItem } from '@tonkeeper/core/src/TonAPI';
import { ViewStyle, Pressable } from 'react-native';
import { memo, useCallback, useMemo } from 'react';
import FastImage from 'react-native-fast-image';
import Animated from 'react-native-reanimated';
import { useRouter } from '@tonkeeper/router';
import { Address } from '@tonkeeper/core';
import { t } from '../../i18n';

interface TransactionNFTItemProps {
  nftAddress?: string;
  nftItem?: NftItem;
  highlightStyle?: ViewStyle;
}

export const TransactionNFTItem = memo<TransactionNFTItemProps>((props) => {
  const { nftAddress, nftItem } = props;
  const router = useRouter();
  const { data: nft } = useNftItemByAddress(props.nftAddress, {
    existingNft: nftItem,
  });

  const handlePress = useCallback(() => {
    const address = nftAddress ?? nftItem?.address;
    if (address) {
      // TODO: Replace with new router
      router.navigate('NFTItemDetails', {
        keyPair: { currency: 'ton', address: Address(address).toFriendly() },
      });
    }
  }, [nftAddress, nftItem?.address]);

  const imagesSource = useMemo(() => {
    // TODO: Replace with NftMapper
    const image = nft?.previews?.find((preview) => preview.resolution === '100x100');

    return { uri: image?.url };
  }, [nft]);

  if (nft) {
    // TODO: Replace with NftMapper
    const isTG = nft.dns?.endsWith('.t.me');
    const isDNS = !!nft.dns && !isTG;
    const name = (isDNS && nft.dns) || nft.metadata.name || Address.toShort(nft.address);

    const collectionName = isDNS
      ? 'TON DNS'
      : nft?.collection
      ? nft.collection.name
      : t('nft_single_nft');

    return (
      <View style={styles.container.static}>
        <Pressable onPress={handlePress}>
          <Animated.View style={[styles.item.static, props.highlightStyle]}>
            <View style={styles.pictureContainer}>
              <FastImage
                resizeMode="cover"
                source={imagesSource}
                style={styles.picture.static}
              />
            </View>
            <View style={styles.infoContainer}>
              <Text type="body2" numberOfLines={1}>
                {name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text type="body2" color="textSecondary" numberOfLines={1}>
                  {collectionName}
                </Text>
                {nft.approved_by.length > 0 && (
                  <Icon
                    style={styles.verificationIcon.static}
                    name="ic-verification-secondary-16"
                    color="iconSecondary"
                  />
                )}
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </View>
    );
  }

  return (
    <Animated.View
      style={[styles.item.static, styles.skeleton.static, props.highlightStyle]}
    >
      <View style={styles.pictureContainer} />
      <View style={styles.infoContainer} />
    </Animated.View>
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
    borderBottomLeftRadius: 12, //corners.small,
    borderTopLeftRadius: 12, //corners.small,
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
