import React, { useCallback } from 'react';
import { NFTKeyPair } from '$store/nfts/interface';
import * as S from './TransactionItemNFT.style';
import { openNFT } from '$navigation';
import { useNFT } from '$hooks/useNFT';
import { maskifyTonAddress, ns } from '$utils';
import _ from 'lodash';
import { Icon, Text } from '$uikit';
import { useTranslator } from '$hooks';
import { View } from 'react-native';
import { dnsToUsername } from '$utils/dnsToUsername';
import { DarkTheme } from '$styled';

export const TransactionItemNFT: React.FC<{ keyPair: NFTKeyPair }> = ({ keyPair }) => {
  const nft = useNFT(keyPair);
  const t = useTranslator();

  // console.log(nft);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleOpenNftItem = useCallback(
    _.throttle(() => openNFT({ currency: nft.currency, address: nft.address }), 1000),
    [nft],
  );

  if (!nft || (!nft.name && !nft?.collection?.name && !nft.content.image.baseUrl)) {
    return null;
  }

  const isTG = (nft.dns || nft.name)?.endsWith('.t.me');
  const isDNS = !!nft.dns && !isTG;

  return (
    <S.Wrap>
      <S.Container>
        {isDNS ? (
          <S.Pressable onPress={handleOpenNftItem}>
            <S.GlobeIcon />
          </S.Pressable>
        ) : null}
        {!isDNS && nft.content?.image?.baseUrl ? (
          <S.Pressable onPress={handleOpenNftItem}>
            <S.Image
              source={{
                uri: nft.content.image.baseUrl,
              }}
            />
          </S.Pressable>
        ) : null}
        <S.TextContainer>
          <S.Pressable
            withImage={!!nft.content?.image?.baseUrl}
            style={{ backgroundColor: DarkTheme.colors.backgroundTertiary }}
            underlayColor={DarkTheme.colors.backgroundTertiary}
            onPress={handleOpenNftItem}
          >
            <S.TextWrap>
              <Text numberOfLines={1} variant="body2">
                {isTG
                  ? dnsToUsername(nft.dns)
                  : nft.dns || nft.name || maskifyTonAddress(nft.address)}
              </Text>
              <S.CollectionNameWrap withIcon={nft.isApproved}>
                <Text color="foregroundSecondary" numberOfLines={1} variant="body2">
                  {isDNS
                    ? 'TON DNS'
                    : nft?.collection
                    ? nft.collection.name
                    : t('nft_single_nft')}
                </Text>
                {nft.isApproved && (
                  <View style={{ flex: 1, marginRight: ns(8) }}>
                    <Icon
                      style={{ marginLeft: ns(4) }}
                      name="ic-verification-secondary-16"
                    />
                  </View>
                )}
              </S.CollectionNameWrap>
            </S.TextWrap>
          </S.Pressable>
        </S.TextContainer>
      </S.Container>
    </S.Wrap>
  );
};
