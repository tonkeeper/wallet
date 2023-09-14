import { useNftItemByAddress } from '../../query/hooks/useNftItemByAddress';
import { Steezy, View, Text, Icon, Picture, ListItemContent } from '@tonkeeper/uikit';
import { NftItem } from '@tonkeeper/core/src/TonAPI';
import { Pressable } from 'react-native';
import { memo, useCallback } from 'react';
import { t } from '../../i18n';

import { openNftModal } from '@tonkeeper/mobile/src/core/NFT/NFT';

interface NftPreviewContentProps {
  nftAddress?: string;
  nftItem?: NftItem;
}

export const NftPreviewContent = memo<NftPreviewContentProps>((props) => {
  const { nftAddress, nftItem } = props;
  const { data: nft } = useNftItemByAddress(props.nftAddress, {
    existingNft: nftItem,
  });

  const handlePress = useCallback(() => {
    const address = nftAddress ?? nftItem?.address;
    if (address) {
      openNftModal(address);
    }
  }, [nftAddress, nftItem?.address]);

  if (nft) {
    return (
      <Pressable onPress={handlePress} style={styles.container.static}>
        <ListItemContent style={styles.item.static}>
          <View style={styles.pictureContainer}>
            <Picture
              preview={nft.image.preview}
              uri={nft.image.small}
              style={styles.picture}
            />
          </View>
          <View style={styles.infoContainer}>
            <Text type="body2" numberOfLines={1}>
              {nft.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text type="body2" color="textSecondary" numberOfLines={1}>
                {nft.collection?.name || t('nft_single_nft')}
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
