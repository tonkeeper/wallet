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
import { dnsToUsername } from '$utils/dnsToUsername';

export const NFTItem: React.FC<NFTItemProps> = ({ item, isLastInRow }) => {
  const flags = useFlags(['disable_apperance']);
  const t = useTranslator();

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
    if (isTG) {
      return dnsToUsername(item.name);
    }

    if (isDNS) {
      return item.dns;
    }

    return item.name || maskifyTonAddress(item.address);
  }, [isDNS, isTG, item.dns, item.name, item.address]);

  const renderPicture = () => {
    if (isDNS) {
      return (
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
      );
    }

    return (
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
    );
  };

  return (
    <S.Wrap withMargin={!isLastInRow}>
      <S.Background />
      <S.Pressable onPress={handleOpenNftItem}>
        {renderPicture()}
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
