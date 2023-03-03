import { useTranslator } from '$hooks';
import { openNFT } from '$navigation';
import { NFTModel } from '$store/models';
import { DarkTheme } from '$styles';
import { Steezy } from '$styles';
import { View, Text, TouchableHighlight, Icon } from '$uikit';
import { checkIsTonDiamondsNFT, maskifyTonAddress } from '$utils';
import { dnsToUsername } from '$utils/dnsToUsername';
import { useFlags } from '$utils/flags';
import _ from 'lodash';
import React, { memo, useCallback, useMemo } from 'react';
import * as S from '../../core/NFTs/NFTItem/NFTItem.style';

interface NFTCardItemProps {
  item: NFTModel;
  onPress?: () => void;
}

export const NFTCardItem = memo<NFTCardItemProps>((props) => {
  const { item } = props;

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

  return (
    <TouchableHighlight 
      underlayColor={DarkTheme.backgroundContentTint}
      style={styles.container}
      activeOpacity={1}
      onPress={handleOpenNftItem}
    >
      <View>
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
        <View style={styles.info}>
          <Text variant="label2" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="body3" color="textSecondary" numberOfLines={1}>
            {isDNS
              ? 'TON DNS'
              : item?.collection
              ? item.collection.name
              : t('nft_single_nft')}
          </Text>
        </View>
      </View>
    </TouchableHighlight>
  );
});

const styles = Steezy.create(({ colors, corners }) => ({
  container: {
    margin: 4,
    width: 114,
    backgroundColor: colors.backgroundContent,
    borderRadius: corners.medium,
    overflow: 'hidden'
  },
  info: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  image: {
    height: 114
  }
}));