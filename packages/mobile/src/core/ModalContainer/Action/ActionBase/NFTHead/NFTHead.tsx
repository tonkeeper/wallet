import React, { useCallback } from 'react';
import * as S from './NFTHead.style';
import { useNFT } from '$hooks/useNFT';
import { NFTKeyPair } from '$store/nfts/interface';
import { Icon } from '$uikit';
import _ from 'lodash';
import { openNFT } from '$navigation';
import { dnsToUsername } from '$utils/dnsToUsername';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { HideableImage } from '$core/HideableAmount/HideableImage';
import { Steezy } from '$styles';
import { DARK_COLORS, RADIUS } from '$styled';
import { t } from '@tonkeeper/shared/i18n';

export const NFTHead: React.FC<{ keyPair: NFTKeyPair }> = ({ keyPair }) => {
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
      {nft?.content?.image?.baseUrl ? (
        <HideableImage
          imageStyle={styles.image.static}
          style={styles.imageContainer.static}
          uri={nft?.content?.image?.baseUrl}
        />
      ) : null}
      <S.NameWrapper>
        <HideableAmount stars="* * * *" numberOfLines={1} variant="h2">
          {isTG
            ? dnsToUsername(nft.dns)
            : nft.dns || nft.name || t('nft_transaction_head_placeholder')}
        </HideableAmount>
      </S.NameWrapper>
      {nft?.collection?.name ? (
        <S.CollectionWrapper>
          <HideableAmount numberOfLines={1} color="foregroundSecondary" variant="body1">
            {isDNS ? 'TON DNS' : nft.collection.name}
          </HideableAmount>
          {nft?.isApproved ? (
            <Icon style={{ marginLeft: 4 }} name="ic-verification-secondary-16" />
          ) : null}
        </S.CollectionWrapper>
      ) : null}
    </S.Wrap>
  );
};

const styles = Steezy.create({
  imageContainer: {
    marginTop: 16,
    zIndex: 2,
    height: 96,
    width: 96,
    backgroundColor: DARK_COLORS.backgroundTertiary,
    marginBottom: 20,
    borderRadius: RADIUS.large,
  },
  image: {
    borderRadius: RADIUS.large,
  },
});
