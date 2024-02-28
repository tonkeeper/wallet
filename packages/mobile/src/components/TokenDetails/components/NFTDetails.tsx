import React, { memo } from 'react';
import { NftItem } from 'tonapi-sdk-js';
import { List } from '$uikit';
import FastImage from 'react-native-fast-image';
import { Steezy } from '@tonkeeper/uikit';
import { Address } from '@tonkeeper/core';
import { useNftItemByAddress } from '@tonkeeper/shared/query/hooks/useNftItemByAddress';

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
        title="Name"
        subtitle={nft?.name}
        value={
          <FastImage
            style={styles.square.static}
            source={{ uri: nft?.image.medium || undefined }}
          />
        }
      />
      <List.Item title="Token ID" subtitle={Address.parse(nft?.address).toShort(4)} />
    </List>
  );
});

export const styles = Steezy.create({
  square: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
});
