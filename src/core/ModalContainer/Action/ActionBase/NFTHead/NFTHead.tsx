import React, { useCallback } from 'react';
import * as S from './NFTHead.style';
import { useNFT } from '$hooks/useNFT';
import { NFTKeyPair } from '$store/nfts/interface';
import { useTranslator } from '$hooks';
import {Icon, Text} from '$uikit';
import _ from 'lodash';
import { openNFT } from '$navigation';
import { dnsToUsername } from '$utils/dnsToUsername';

export const NFTHead: React.FC<{ keyPair: NFTKeyPair }> = ({ keyPair }) => {
  const t = useTranslator();
  const nft = useNFT(keyPair);

  const isTG = (nft.dns || nft.name)?.endsWith('.t.me');
  const isDNS = !!nft.dns && !isTG;

  const handleOpenNftItem = useCallback(
    _.throttle(() => openNFT({ currency: nft.currency, address: nft.address }), 1000),
    [nft],
  );

  if (!nft) {
    return null;
  }
  return (
    <S.Wrap activeOpacity={0.6} onPress={handleOpenNftItem}>
      {isDNS ? (
        <S.GlobeIcon />
      ) : null}
      {!isDNS && nft?.content?.image?.baseUrl ? (
        <S.Image source={{ uri: nft?.content?.image?.baseUrl }} />
      ) : null}
      <S.NameWrapper>
        <Text numberOfLines={1} variant="h2">
          {isTG ? dnsToUsername(nft.dns) : (nft.dns || nft.name || t('nft_transaction_head_placeholder'))}
        </Text>
      </S.NameWrapper>
      {nft?.collection?.name ? (
        <S.CollectionWrapper>
          <Text numberOfLines={1} color="foregroundSecondary" variant="body1">
            {isDNS ? 'TON DNS' : nft.collection.name}
          </Text>
          {nft?.isApproved ? (
            <Icon style={{ marginLeft: 4 }} name="ic-verification-secondary-16" />
          ) : null}
        </S.CollectionWrapper>
      ) : null}
    </S.Wrap>
  );
};
