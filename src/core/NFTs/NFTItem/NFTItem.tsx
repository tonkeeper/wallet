import React, { useCallback, useMemo } from 'react';
import { NFTItemProps } from '$core/NFTs/NFTItem/NFTItem.interface';
import * as S from './NFTItem.style';
import { openNFT } from '$navigation';
import { checkIsTonDiamondsNFT, maskifyTonAddress } from '$utils';
import _ from 'lodash';
import { Icon, Text } from '$uikit';
import { useTranslator } from '$hooks';
import { useFlags } from '$utils/flags';
import { View } from 'react-native';

export const NFTItem: React.FC<NFTItemProps> = ({ item, isLastInRow }) => {
  const flags = useFlags(['disable_apperance']);
  const t = useTranslator();

  const isTonDiamondsNft = checkIsTonDiamondsNFT(item);
  const isOnSale = useMemo(() => !!item.sale, [item.sale]);
  const isDNS = !!item.dns;

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

  return (
    <S.Wrap withMargin={!isLastInRow}>
      <S.Background />
      <S.Pressable onPress={handleOpenNftItem}>
        {isDNS ? (
          <S.DNSBackground>
            <Text style={S.textStyles.domainText} numberOfLines={4} ellipsizeMode="tail">
              {item.dns?.replace('.ton', '')}
            </Text>
            <Text style={[S.textStyles.domainZoneText, S.textStyles.domainText]}>
              {'.ton'}
            </Text>
            <S.OnSaleBadge>{isOnSale ? <S.OnSaleBadgeIcon /> : null}</S.OnSaleBadge>
            <S.Badges>
              <S.DNSBadge>
                <Icon name="ic-globe-16" color="constantLight" />
              </S.DNSBadge>
            </S.Badges>
          </S.DNSBackground>
        ) : (
          <S.Image
            source={{
              uri: item.content.image.baseUrl,
            }}
          >
            <S.OnSaleBadge>{isOnSale ? <S.OnSaleBadgeIcon /> : null}</S.OnSaleBadge>
            <S.Badges>
              {isTonDiamondsNft && !flags.disable_apperance ? (
                <S.AppearanceBadge>
                  <Icon name="ic-appearance-16" color="constantLight" />
                </S.AppearanceBadge>
              ) : null}
            </S.Badges>
          </S.Image>
        )}
        <S.TextWrap>
          <Text numberOfLines={1} fontSize={16} lineHeight={24} fontWeight="700">
            {title}
          </Text>
          <S.CollectionNameWrap withIcon={item.isApproved}>
            <Text numberOfLines={1} color="foregroundSecondary" variant="body2">
              {isDNS
                ? 'TON DNS'
                : item?.collection
                ? item.collection.name
                : t('nft_single_nft')}
            </Text>
            {item.isApproved && (
              <Icon style={{ marginLeft: 4 }} name="ic-verification-secondary-16" />
            )}
          </S.CollectionNameWrap>
        </S.TextWrap>
      </S.Pressable>
    </S.Wrap>
  );
};
