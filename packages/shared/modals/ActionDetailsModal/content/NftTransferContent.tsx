import { NftItemTransferAction, CustomAccountEvent } from '@tonkeeper/core/src/TonAPI';
import { DetailedInfoContainer } from '../components/DetailedInfoContainer';
import { DetailedActionTime } from '../components/DetailedActionTime';
import { AddressListItem } from '../components/AddressListItem';
import { DetailedHeader } from '../components/DetailedHeader';
import { ExtraListItem } from '../components/ExtraListItem';
import { Icon, List, TouchableOpacity, View, useTheme } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { StyleSheet } from 'react-native';
import { memo, useCallback, useMemo } from 'react';
import { useNftItemByAddress } from '@tonkeeper/core/src/query/useNftItemByAddress';

interface NftTransferContentProps {
  action: NftItemTransferAction;
  event: CustomAccountEvent;
}

import { HideableImage } from '@tonkeeper/mobile/src/core/HideableAmount/HideableImage';
import { corners } from '@tonkeeper/uikit/src/styles/constants';
import { openNftModal } from '@tonkeeper/mobile/src/core/NFT/NFT';
import { dnsToUsername } from '@tonkeeper/mobile/src/utils/dnsToUsername';
import { HideableAmount } from '@tonkeeper/mobile/src/core/HideableAmount/HideableAmount';
import _ from 'lodash';

export const NftTransferContent = memo<NftTransferContentProps>((props) => {
  const { action, event } = props;
  const { data: nft } = useNftItemByAddress(action.nft);
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
    <View>
      <DetailedInfoContainer>
        <DetailedHeader indentButtom={false} isScam={event.is_scam}>
          <TouchableOpacity activeOpacity={0.6} onPress={handleOpenNftItem} style={styles.nft}>
            {imagesSource && (
              <HideableImage
                imageStyle={[
                  styles.image,
                  { backgroundColor: theme.backgroundContentTint },
                ]}
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
                      : nft.dns || t('nft_transaction_head_placeholder')}
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
                      <Icon
                        style={{ marginLeft: 4 }}
                        name="ic-verification-secondary-16"
                      />
                    ) : null}
                  </View>
                ) : null}
              </View>
            )}
          </TouchableOpacity>
        </DetailedHeader>
        
        <DetailedActionTime destination={event.destination} timestamp={event.timestamp} />
      </DetailedInfoContainer>
      <List>
        <AddressListItem
          destination={event.destination}
          recipient={action.recipient}
          sender={action.sender}
        />
        <ExtraListItem extra={event.extra} />
      </List>
    </View>
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
  }
});
