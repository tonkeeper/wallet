import { Icon, TouchableOpacity, View, useTheme } from '@tonkeeper/uikit';
import { NftItem } from '@tonkeeper/core/src/TonAPI';
import { memo, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { t } from '../../../i18n';

import { useNftItemByAddress } from '@tonkeeper/core/src/query/useNftItemByAddress';
import { HideableImage } from '@tonkeeper/mobile/src/core/HideableAmount/HideableImage';
import { corners } from '@tonkeeper/uikit/src/styles/constants';
import { openNftModal } from '@tonkeeper/mobile/src/core/NFT/NFT';
import { dnsToUsername } from '@tonkeeper/mobile/src/utils/dnsToUsername';
import { HideableAmount } from '@tonkeeper/mobile/src/core/HideableAmount/HideableAmount';
import _ from 'lodash';

interface DetailedNftItemProps {
  nftAddress?: string;
  nft?: NftItem;
}

export const DetailedNftItem = memo<DetailedNftItemProps>((props) => {
  const { data: nft } = useNftItemByAddress(props.nftAddress, { existingNft: props.nft });
  const theme = useTheme();

  const imagesSource = useMemo(() => {
    // TODO: Replace with NftMapper
    const image = nft?.previews?.find((preview) => preview.resolution === '100x100');

    return image?.url;
  }, [nft]);

  const handleOpenNftItem = useCallback(
    _.throttle(() => {
      if (nft) {
        openNftModal(nft.address);
      }
    }, 1000),
    [nft],
  );

  const isTG = nft?.dns?.endsWith('.t.me');
  const isDNS = !!nft?.dns && !isTG;

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={handleOpenNftItem} style={styles.nft}>
      {imagesSource && (
        <HideableImage
          imageStyle={[styles.image, { backgroundColor: theme.backgroundContentTint }]}
          style={styles.imageContainer}
          uri={imagesSource}
        />
      )}
      {nft && (
        <View>
          <View style={styles.nftNameContainer}>
            <HideableAmount stars="* * * *" numberOfLines={1} variant="h2">
              {isTG
                ? dnsToUsername(nft.dns)
                : nft.dns || nft.metadata?.name || t('nft_transaction_head_placeholder')}
            </HideableAmount>
          </View>
          {nft?.collection?.name ? (
            <View style={styles.nftCollectionContainer}>
              <HideableAmount
                numberOfLines={1}
                color="foregroundSecondary"
                variant="body1"
              >
                {isDNS ? 'TON DNS' : nft.collection.name}
              </HideableAmount>
              {nft?.approved_by.length > 0 ? (
                <Icon style={{ marginLeft: 4 }} name="ic-verification-secondary-16" color="iconSecondary" />
              ) : null}
            </View>
          ) : null}
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
