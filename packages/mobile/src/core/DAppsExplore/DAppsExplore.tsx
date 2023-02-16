import { useTranslator } from '$hooks';
import { DeeplinkOrigin, useDeeplinking } from '$libs/deeplinking';
import { openDAppsSearch, openRequireWalletModal, openScanQR } from '$navigation';
import { IsTablet, LargeNavBarHeight, TabletMaxWidth } from '$shared/constants';
import { store, useAppsListStore } from '$store';
import { Icon, LargeNavBar, NavBar } from '$uikit';
import { useScrollHandler } from '$uikit/ScrollHandler/useScrollHandler';
import { deviceWidth } from '$utils';
import { useFlags } from '$utils/flags';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { FC, memo, useCallback, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ConnectedApps,
  PopularApps,
  SearchButton,
  AboutDApps,
  TopTabs,
} from './components';
import * as S from './DAppsExplore.style';

export interface DAppsExploreProps {}

const DAppsExploreComponent: FC<DAppsExploreProps> = (props) => {
  const {} = props;

  const flags = useFlags(['disable_dapps']);

  const t = useTranslator();
  const tabBarHeight = useBottomTabBarHeight();
  const deeplinking = useDeeplinking();

  const { categories } = useAppsListStore();

  const [connectedAppsHeight, setConnectedAppsHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);

  const tabsSnapOffset = connectedAppsHeight + LargeNavBarHeight + 4;

  const { top: topInset } = useSafeAreaInsets();

  const [activeCategory, setActiveCategory] = useState('featured');

  const { isSnapPointReached, scrollRef, scrollTop, scrollHandler } = useScrollHandler(
    tabsSnapOffset,
    true,
  );

  const handlePressOpenScanQR = React.useCallback(() => {
    if (store.getState().wallet.wallet) {
      openScanQR((str) => {
        const resolver = deeplinking.getResolver(str, {
          delay: 200,
          origin: DeeplinkOrigin.QR_CODE,
        });
        if (resolver) {
          resolver();
          return true;
        }

        return false;
      });
    } else {
      openRequireWalletModal();
    }
  }, [deeplinking]);

  const handleSearchPress = useCallback(() => {
    openDAppsSearch();
  }, []);

  const handleScrollViewLayout = useCallback((event: LayoutChangeEvent) => {
    setScrollViewHeight(event.nativeEvent.layout.height);
  }, []);

  const handleConnectedAppsLayout = useCallback((event: LayoutChangeEvent) => {
    setConnectedAppsHeight(event.nativeEvent.layout.height);
  }, []);

  const navBarRight = (
    <TouchableOpacity
      onPress={handlePressOpenScanQR}
      style={{ zIndex: 3 }}
      activeOpacity={0.6}
      hitSlop={{
        top: 26,
        bottom: 26,
        left: 26,
        right: 26,
      }}
    >
      <Icon name="ic-viewfinder-28" color="accentPrimary" />
    </TouchableOpacity>
  );

  const isBigScreen = deviceWidth > TabletMaxWidth;

  return (
    <S.Wrap>
      <S.ScrollViewContainer topInset={topInset}>
        <Animated.ScrollView
          ref={scrollRef}
          onLayout={handleScrollViewLayout}
          onScroll={scrollHandler}
          showsVerticalScrollIndicator={false}
          // eslint-disable-next-line react-native/no-inline-styles
          contentContainerStyle={{
            minHeight:
              !flags.disable_dapps && scrollViewHeight > 0
                ? scrollViewHeight + tabsSnapOffset
                : undefined,
          }}
          scrollEventThrottle={16}
          stickyHeaderIndices={[0, 3]}
          // snapToOffsets={isSnapPointReached ? undefined : [tabsSnapOffset]}
        >
          {isBigScreen ? (
            <NavBar
              hideBackButton
              scrollTop={scrollTop}
              rightContent={navBarRight}
              withBackground={IsTablet}
            >
              {t('browser.title')}
            </NavBar>
          ) : (
            <LargeNavBar
              scrollTop={scrollTop}
              rightContent={navBarRight}
              safeArea={false}
              border={false}
            >
              {t('browser.title')}
            </LargeNavBar>
          )}
          <S.NavBarSpacer />
          {!flags.disable_dapps ? (
            <S.ContentWrapper>
              <S.Content onLayout={handleConnectedAppsLayout}>
                <ConnectedApps />
              </S.Content>
            </S.ContentWrapper>
          ) : null}
          {!flags.disable_dapps ? (
            <S.ContentWrapper>
              <S.Content>
                <TopTabs
                  tabs={categories}
                  selectedId={activeCategory}
                  onChange={(value) => {
                    scrollRef.current?.scrollTo({
                      y: Math.min(scrollTop.value, tabsSnapOffset),
                      animated: false,
                    });
                    setActiveCategory(value);
                  }}
                />
              </S.Content>
            </S.ContentWrapper>
          ) : null}
          {!flags.disable_dapps ? (
            <S.ContentWrapper>
              <S.Content>
                <PopularApps activeCategory={activeCategory} />
              </S.Content>
            </S.ContentWrapper>
          ) : null}
          {flags.disable_dapps ? (
            <S.ContentWrapper>
              <S.Content>
                <AboutDApps />
              </S.Content>
            </S.ContentWrapper>
          ) : null}
        </Animated.ScrollView>
      </S.ScrollViewContainer>
      <S.ContentWrapper>
        <S.Content>
          <S.SearchBarContainer tabBarHeight={tabBarHeight}>
            <SearchButton onPress={handleSearchPress} />
          </S.SearchBarContainer>
        </S.Content>
      </S.ContentWrapper>
    </S.Wrap>
  );
};

export const DAppsExplore = memo(DAppsExploreComponent);
