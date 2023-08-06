import React, { useCallback } from 'react';
import { NFTKeyPair } from '$store/nfts/interface';
import * as S from './TransactionItemNFT.style';
import { openNFT } from '$navigation/helper';
import { useNFT } from '$hooks/useNFT';
import _ from 'lodash';
import { Icon } from '$uikit/Icon/Icon';

import { View } from 'react-native';
import { DarkTheme } from '$styled/theme';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { HideableImage } from '$core/HideableAmount/HideableImage';
import { Steezy } from '@tonkeeper/uikit';
import { t } from '@tonkeeper/shared/i18n';
import { Address } from '@tonkeeper/core';

export const TransactionItemNFT: React.FC<{ keyPair: NFTKeyPair }> = ({ keyPair }) => {
  const nft = useNFT(keyPair);


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
        {nft.content?.image?.baseUrl ? (
          <S.Pressable onPress={handleOpenNftItem}>
            <HideableImage
              imageStyle={styles.image.static}
              style={styles.imageContainer.static}
              uri={nft.content.image.baseUrl}
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
              <HideableAmount stars="* * * *" numberOfLines={1} variant="body2">
                {(isDNS && nft.dns) || nft.name || Address.toShort(nft.address)}
              </HideableAmount>
              <S.CollectionNameWrap withIcon={nft.isApproved}>
                <HideableAmount
                  color="foregroundSecondary"
                  numberOfLines={1}
                  variant="body2"
                >
                  {isDNS
                    ? 'TON DNS'
                    : nft?.collection
                    ? nft.collection.name
                    : t('nft_single_nft')}
                </HideableAmount>
                {nft.isApproved && (
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Icon
                      style={{ marginLeft: 4 }}
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

const styles = Steezy.create({
  imageContainer: {
    zIndex: 2,
    width: 64,
    height: 64,
    backgroundColor: DarkTheme.colors.backgroundQuaternary,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  image: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
});
