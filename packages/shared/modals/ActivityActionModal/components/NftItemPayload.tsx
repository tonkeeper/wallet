import { useNftItem } from '../../../query/hooks/useNftItem';
import { Icon, TouchableOpacity, View, useTheme } from '@tonkeeper/uikit';

import { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { t } from '../../../i18n';

import { HideableImage } from '@tonkeeper/mobile/src/core/HideableAmount/HideableImage';
import { corners } from '@tonkeeper/uikit/src/styles/constants';
import { openNftModal } from '@tonkeeper/mobile/src/core/NFT/NFT';
import { NftItem } from '@tonkeeper/core';
import { HideableText } from '../../../components/HideableText';

interface NftItemPayloadProps {
  nftAddress?: string;
  nft?: NftItem;
}

export const NftItemPayload = memo<NftItemPayloadProps>((props) => {
  const nft = useNftItem(props.nftAddress, props.nft);
  const theme = useTheme();

  const handleOpenNftItem = useCallback(() => {
    if (nft) {
      openNftModal(nft.address);
    }
  }, []);

  if (!nft) {
    return null;
  }

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={handleOpenNftItem} style={styles.nft}>
      {nft.image.small && (
        <HideableImage
          imageStyle={[styles.image, { backgroundColor: theme.backgroundContentTint }]}
          style={styles.imageContainer}
          uri={nft.image.small}
        />
      )}
      <View style={styles.nftNameContainer}>
        <HideableText numStars={4} numberOfLines={1} type="h2">
          {nft.name || t('nft_transaction_head_placeholder')}
        </HideableText>
      </View>
      {!!nft.collection?.name && (
        <View style={styles.nftCollectionContainer}>
          <HideableText numberOfLines={1} color="textSecondary" type="body1">
            {nft.collection.name}
          </HideableText>
          {nft.approved_by.length > 0 && (
            <Icon
              style={{ marginLeft: 4 }}
              name="ic-verification-secondary-16"
              color="iconSecondary"
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  imageContainer: {
    zIndex: 2,
    height: 96,
    width: 96,
    marginBottom: 20,
    borderRadius: corners.large,
  },
  image: {
    borderRadius: corners.large,
  },
  nftNameContainer: {
    marginBottom: 2,
    alignItems: 'center',
  },
  nftCollectionContainer: {
    marginBottom: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nft: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
