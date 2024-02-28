import React, { memo } from 'react';
import { NftItem } from 'tonapi-sdk-js';
import { List } from '$uikit';
import FastImage from 'react-native-fast-image';
import { Steezy, copyText, View, Icon } from '@tonkeeper/uikit';
import { Address } from '@tonkeeper/core';
import { useNftItemByAddress } from '@tonkeeper/shared/query/hooks/useNftItemByAddress';
import { t } from '@tonkeeper/shared/i18n';

export interface NFTDetailsProps {
  nft: NftItem | string;
}

export const NFTDetails = memo<NFTDetailsProps>((props) => {
  const { data: nft } = useNftItemByAddress(
    typeof props.nft === 'string' ? props.nft : undefined,
    {
      existingNft: typeof props.nft === 'string' ? undefined : props.nft,
    },
  );

  if (!nft) {
    return null;
  }

  return (
    <List compact={false}>
      <List.Item
        onPress={copyText(nft?.name)}
        title={t('tokenDetails.name')}
        subtitle={nft?.name}
        value={
          <FastImage
            style={styles.square.static}
            source={{ uri: nft?.image.medium || undefined }}
          />
        }
      />
      <List.Item
        onPress={copyText(nft?.address)}
        title={t('tokenDetails.token_id')}
        subtitle={Address.parse(nft?.address).toShort(4)}
        value={
          <View style={styles.copyIconContainer}>
            <Icon color="iconSecondary" name={'ic-copy-16'} />
          </View>
        }
      />
    </List>
  );
});

export const styles = Steezy.create({
  square: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  copyIconContainer: {
    margin: 4,
  },
});
