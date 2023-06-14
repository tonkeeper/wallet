import { useTheme, useTranslator } from '$hooks';
import { DeeplinkOrigin, useDeeplinking } from '$libs/deeplinking';
import {
  openDAppsSearch,
  openRequireWalletModal,
  openScanQR,
  TabsStackRouteNames,
} from '$navigation';
import { IsTablet, LargeNavBarHeight, TabletMaxWidth } from '$shared/constants';
import { store, useAppsListStore } from '$store';
import { Icon, LargeNavBar, NavBar } from '$uikit';
import { useScrollHandler } from '$uikit/ScrollHandler/useScrollHandler';
import { deviceWidth, ns } from '$utils';
import { useFlags } from '$utils/flags';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet } from 'react-native';
import { TouchableOpacity, ScrollView } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ConnectedApps,
  PopularApps,
  SearchButton,
  AboutDApps,
  TopTabs,
  TopTabsHeight,
} from './components';
import * as S from './DAppsExplore.style';
import { NavBarSpacerHeight } from './DAppsExplore.style';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabStackParamList } from '$navigation/MainStack/TabStack/TabStack.interface';

const OFFSET = ns(16);

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export type DAppsExploreProps = NativeStackScreenProps<
  TabStackParamList,
  TabsStackRouteNames.Explore
>;

const DAppsExploreComponent: FC<DAppsExploreProps> = (props) => {
  const { initialCategory } = props.route?.params || {};
  const { setParams } = props.navigation;

  const flags = useFlags(['disable_dapps']);

  const t = useTranslator();
  const tabBarHeight = useBottomTabBarHeight();
  const deeplinking = useDeeplinking();

  const theme = useTheme();

  const { categories } = useAppsListStore();

  const [connectedAppsHeight, setConnectedAppsHeight] = useState(0);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [popularAppsHeight, setPopularAppsHeight] = useState(0);

  const tabsSnapOffset = connectedAppsHeight + LargeNavBarHeight + 4;

  const { top: topInset } = useSafeAreaInsets();

  const [activeCategory, setActiveCategory] = useState('featured');

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
      setParams({ initialCategory: undefined });
    }
  }, [initialCategory]);

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

  const contentHeight = popularAppsHeight + tabsSnapOffset + TopTabsHeight - OFFSET;

  const bottomDividerStyle = useAnimatedStyle(() => ({
    opacity:
      contentHeight > scrollViewHeight &&
      scrollTop.value + scrollViewHeight < contentHeight
        ? 1
        : 0,
  }));

  const topTabsDividerStyle = useAnimatedStyle(() => ({
    opacity: scrollTop.value > tabsSnapOffset ? 1 : 0,
  }));

  const navBarOpacity = useDerivedValue(() =>
    interpolate(
      scrollTop.value,
      [
        connectedAppsHeight + NavBarSpacerHeight,
        connectedAppsHeight + NavBarSpacerHeight + LargeNavBarHeight / 3.5,
      ],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  );

  const topTabsContainerStyle = useAnimatedStyle(() => ({
    backgroundColor:
      navBarOpacity.value === 0 ? theme.colors.backgroundPrimary : 'transparent',
  }));

  const tabScrollView = useRef<ScrollView>(null);

  const navBarRight = (
    <TouchableOpacity
      onPress={handlePressOpenScanQR}
      style={styles.scanButton}
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
        <AnimatedScrollView
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
          // snapToOffsets={
          //   isSnapPointReached || tabsSnapOffset > scrollViewHeight / 2
          //     ? undefined
          //     : [tabsSnapOffset]
          // }
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
              opacity={navBarOpacity}
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
                <Animated.View style={topTabsContainerStyle}>
                  <TopTabs
                    ref={tabScrollView}
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
                </Animated.View>
                <S.TopTabsDivider style={topTabsDividerStyle} />
              </S.Content>
            </S.ContentWrapper>
          ) : null}
          {!flags.disable_dapps ? (
            <S.ContentWrapper>
              <S.Content
                onLayout={(event) =>
                  setPopularAppsHeight(event.nativeEvent.layout.height)
                }
              >
                <PopularApps
                  onChangeStep={(step) => {
                    if (step >= 2) {
                      tabScrollView.current?.scrollToEnd();
                    } else {
                      tabScrollView.current?.scrollTo({ x: 0 });
                    }
                  }}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                />
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
        </AnimatedScrollView>
      </S.ScrollViewContainer>
      <S.ContentWrapper>
        <S.Content>
          <S.SearchBarContainer tabBarHeight={tabBarHeight}>
            <S.SearchBarDivider style={bottomDividerStyle} />
            <SearchButton onPress={handleSearchPress} />
          </S.SearchBarContainer>
        </S.Content>
      </S.ContentWrapper>
    </S.Wrap>
  );
};

export const DAppsExplore = memo(DAppsExploreComponent);

const styles = StyleSheet.create({
  scanButton: {
    zIndex: 3,
    marginRight: ns(2),
  },
});
