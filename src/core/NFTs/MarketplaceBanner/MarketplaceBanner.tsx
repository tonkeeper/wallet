import React, { useContext } from 'react';
import * as S from './MarketplaceBanner.style';
import { useTranslator } from '$hooks';
import {Button, ScrollPositionContext, Text} from '$uikit';
import { MarketplaceBannerProps } from './MarketplaceBanner.interface';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ns } from '$utils';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFlags } from '$utils/flags';

const images = {
  1: [
    require('$assets/marketplaceBannerNFTs/1.png'),
    require('$assets/marketplaceBannerNFTs/2.png'),
    require('$assets/marketplaceBannerNFTs/3.png'),
  ],
  2: [
    require('$assets/marketplaceBannerNFTs/4.png'),
    require('$assets/marketplaceBannerNFTs/5.png'),
    require('$assets/marketplaceBannerNFTs/6.png'),
    require('$assets/marketplaceBannerNFTs/7.png'),
  ],
};

export const MarketplaceBanner: React.FC<MarketplaceBannerProps> = ({
  onButtonPress,
}) => {
  const flags = useFlags(['disable_nft_markets']);
  const t = useTranslator();
  const tabBarHeight = useBottomTabBarHeight();
  const { changeEnd } = useContext(ScrollPositionContext);
  const { top: topInset } = useSafeAreaInsets();

  useFocusEffect(
    React.useCallback(() => {
      changeEnd(true);
    }, [changeEnd]),
  );

  return (
    <S.Wrap style={{ paddingBottom: tabBarHeight }}>
      <S.Cont style={{ marginTop: topInset + 18 }}>
        <S.ImagesFirstContainer>
          {images[1].map((img, idx, arr) => (
            <S.Image
              isLast={idx + 1 === arr.length}
              key={`marketplaceBanner_1_${idx}`}
              source={img}
            />
          ))}
        </S.ImagesFirstContainer>
        <S.ImagesSecondContainer>
          {images[2].map((img, idx, arr) => (
            <S.Image
              isLast={idx + 1 === arr.length}
              key={`marketplaceBanner_2_${idx}`}
              source={img}
            />
          ))}
        </S.ImagesSecondContainer>
        <S.TextCont>
          <S.TitleWrapper>
            <Text textAlign="center" variant="h2">
              {t('nft_marketplace_banner_title')}
            </Text>
          </S.TitleWrapper>
          <Text textAlign="center" color="foregroundSecondary" variant="body1">
            {
              flags.disable_nft_markets 
                ? t('disable_nft_marketplace_banner_description')
                : t('nft_marketplace_banner_description')
            }
          </Text>
        </S.TextCont>
        {!flags.disable_nft_markets && (
          <Button
            style={{ marginTop: ns(24) }}
            onPress={onButtonPress}
            mode="secondary"
            size="large_rounded"
          >
            {t('nft_browse_markets')}
          </Button>
        )}
      </S.Cont>
    </S.Wrap>
  );
};
