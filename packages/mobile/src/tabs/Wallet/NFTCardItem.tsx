import { useTranslator } from '$hooks';
import { openNFT } from '$navigation';
import { DarkTheme } from '$styles';
import { Steezy } from '$styles';
import { View, Icon, Pressable } from '$uikit';
import { checkIsTonDiamondsNFT, maskifyTonAddress } from '$utils';
import { useFlags } from '$utils/flags';
import _ from 'lodash';
import React, { memo, useCallback, useMemo } from 'react';
import * as S from '../../core/NFTs/NFTItem/NFTItem.style';
import { useExpiringDomains } from '$store/zustand/domains/useExpiringDomains';
import { Address } from '$libs/Ton';
import { HideableAmount } from '$core/HideableAmount/HideableAmount';
import { HideableImage } from '$core/HideableAmount/HideableImage';

interface NFTCardItemProps {
  item: any;
  onPress?: () => void;
}

export const NFTCardItem = memo<NFTCardItemProps>((props) => {
  const { item } = props;

  const flags = useFlags(['disable_apperance']);
  const t = useTranslator();

  const expiringDomains = useExpiringDomains((state) => state.domains);
  const isTonDiamondsNft = checkIsTonDiamondsNFT(item);
  const isOnSale = useMemo(() => !!item.sale, [item.sale]);
  const isTG = (item.dns || item.name)?.endsWith('.t.me');
  const isDNS = !!item.dns && !isTG;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleOpenNftItem = useCallback(
    _.throttle(() => openNFT({ currency: item.currency, address: item.address }), 1000),
    [item],
  );

  const title = useMemo(() => {
    if (isDNS) {
      return item.dns;
    }

    return item.name || maskifyTonAddress(item.address);
  }, [isDNS, item.dns, item.name, item.address]);

  const nftRawAddress = useMemo(
    () => new Address(item.address).format({ raw: true }),
    [],
  );

  return (
    <Pressable
      underlayColor={DarkTheme.backgroundContentTint}
      backgroundColor={DarkTheme.backgroundContent}
      style={styles.container}
      onPress={handleOpenNftItem}
    >
      <HideableImage uri={item.content.image.baseUrl} style={styles.image.static}>
        <S.OnSaleBadge>
          {isOnSale && <Icon name="ic-sale-badge-32" colorless />}
        </S.OnSaleBadge>
        <S.Badges>
          {isTonDiamondsNft && !flags.disable_apperance ? (
            <S.AppearanceBadge>
              <Icon name="ic-appearance-16" color="constantLight" />
            </S.AppearanceBadge>
          ) : null}
        </S.Badges>
        {expiringDomains[nftRawAddress] && (
          <S.FireBadge>
            <Icon name="ic-fire-badge-32" colorless />
          </S.FireBadge>
        )}
      </HideableImage>
      <View style={styles.info}>
        <HideableAmount stars="* * * *" variant="label2" numberOfLines={1}>
          {title}
        </HideableAmount>
        <HideableAmount variant="body3" color="textSecondary" numberOfLines={1}>
          {isDNS
            ? 'TON DNS'
            : item?.collection
            ? item.collection.name || t('nft_unnamed_collection')
            : t('nft_single_nft')}
        </HideableAmount>
      </View>
    </Pressable>
  );
});

const styles = Steezy.create(({ colors, corners }) => ({
  container: {
    position: 'relative',
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 8,
    backgroundColor: colors.backgroundContent,
    borderRadius: corners.medium,
    overflow: 'hidden',
  },
  info: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  blur: {
    zIndex: 3,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 50,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    background: DarkTheme.backgroundTertiary,
  },
}));
