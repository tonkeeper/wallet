import React, { FC, useCallback, useMemo } from 'react';

import * as S from './NFTs.style';
import { Button, ScrollHandler, AnimatedFlatList } from '$uikit';
import { useTheme, useTranslator } from '$hooks';
import { RefreshControl } from 'react-native';
import { MarketplaceBanner } from '$core/NFTs/MarketplaceBanner/MarketplaceBanner';
import { hNs, ns } from '$utils';
import { IsTablet, LargeNavBarHeight } from '$shared/constants';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NFTItem } from '$core/NFTs/NFTItem/NFTItem';
import { useDispatch, useSelector } from 'react-redux';
import { nftsActions, nftsSelector } from '$store/nfts';
import { useIsFocused } from '@react-navigation/native';
import { openMarketplaces } from '$navigation';
import { NUM_OF_COLUMNS } from '$core/NFTs/NFTItem/NFTItem.style';
import { useFlags } from '$utils/flags';

export const NFTs: FC = () => {
  const flags = useFlags(['disable_nft_markets']);

  const theme = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const t = useTranslator();
  const { myNfts, isLoading, canLoadMore } = useSelector(nftsSelector);
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const data = useMemo(() => Object.values(myNfts), [myNfts]);

  const handleOpenMarketplace = useCallback(() => {
    openMarketplaces();
  }, []);

  const handleRefresh = useCallback(() => {
    dispatch(nftsActions.loadNFTs({ isReplace: true }));
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (isLoading || !canLoadMore) {
      return;
    }

    dispatch(nftsActions.loadNFTs({ isLoadMore: true }));
  }, [isLoading, canLoadMore, dispatch]);

  function renderRightButton() {
    if (!flags.disable_nft_markets) {
      return (
        <S.RightButtonContainer>
          <Button onPress={handleOpenMarketplace} mode="secondary" size="navbar_small">
            {t('nft_marketplaces')}
          </Button>
        </S.RightButtonContainer>
      );
    }
  }

  function renderItem({ item, index }) {
    return (
      <NFTItem item={item} isLastInRow={index % NUM_OF_COLUMNS === NUM_OF_COLUMNS - 1} />
    );
  }

  const keyExtractor = useCallback((item) => item.address, []);

  if (!data.length) {
    return <MarketplaceBanner onButtonPress={handleOpenMarketplace} />;
  }

  return (
    <S.Wrap>
      <ScrollHandler navBarRight={renderRightButton} navBarTitle={t('nft_title')}>
        <AnimatedFlatList
          refreshControl={
            <RefreshControl
              onRefresh={handleRefresh}
              refreshing={isLoading && isFocused}
              tintColor={theme.colors.foregroundPrimary}
            />
          }
          numColumns={NUM_OF_COLUMNS}
          showsVerticalScrollIndicator={false}
          data={data}
          scrollEventThrottle={16}
          maxToRenderPerBatch={8}
          style={{ alignSelf: IsTablet ? 'center' : 'auto' }}
          contentContainerStyle={{
            paddingTop: IsTablet ? ns(8) : hNs(LargeNavBarHeight - 4),
            paddingHorizontal: ns(16),
            paddingBottom: tabBarHeight,
          }}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onEndReachedThreshold={0.01}
          onEndReached={isLoading || !canLoadMore ? undefined : handleLoadMore}
        />
      </ScrollHandler>
    </S.Wrap>
  );
};
