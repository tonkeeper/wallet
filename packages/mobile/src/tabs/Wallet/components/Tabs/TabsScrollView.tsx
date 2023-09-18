import React, { useEffect, useRef, useState } from 'react';
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useTabCtx } from './TabsContainer';
import { ScrollViewProps, useWindowDimensions, View } from 'react-native';
import { useCurrentTab } from './TabsSection';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LargeNavBarHeight, NavBarHeight } from '$shared/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScrollToTop } from '@react-navigation/native';
import { useScrollHandler } from '$uikit/ScrollHandler/useScrollHandler';
import { LargeNavBarInteractiveDistance } from '$uikit/LargeNavBar/LargeNavBar';

interface TabsScrollViewProps extends ScrollViewProps {}

export const TabsScrollView = (props: TabsScrollViewProps) => {
  const {
    activeIndex,
    scrollAllTo,
    setScrollTo,
    headerOffsetStyle,
    contentOffset,
    scrollY,
    headerHeight,
    correctIntermediateHeaderState,
  } = useTabCtx();
  const { index } = useCurrentTab();
  const tabBarHeight = 0;
  const [contentSize, setContentSize] = useState(0);
  const safeArea = useSafeAreaInsets();

  const ref = useRef<Animated.ScrollView>(null);
  const { changeScrollOnJS } = useScrollHandler();

  useScrollToTop(ref);

  const localScrollY = useSharedValue(0);
  const hasSpace = useSharedValue(true);

  const scrollTo = React.useCallback(
    (y: number, animated?: boolean, withDelay?: boolean) => {
      hasSpace.value = true;

      if (withDelay) {
        setTimeout(() => {
          ref.current?.scrollTo({ y, animated });
        }, 200);
      } else {
        ref.current?.scrollTo({ y, animated });
      }
    },
    [contentSize],
  );

  useEffect(() => {
    setScrollTo(index, scrollTo);
  }, []);

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll(event) {
        localScrollY.value = event.contentOffset.y;
        if (activeIndex === index) {
          contentOffset.value = 0;
          scrollY.value = event.contentOffset.y;
          hasSpace.value = false;

          runOnJS(changeScrollOnJS)(
            event.contentOffset.y,
            event.contentSize.height,
            event.layoutMeasurement.height,
          );
        }
      },
      onEndDrag(event) {
        if (activeIndex === index) {
          scrollY.value = event.contentOffset.y;
          contentOffset.value = event.contentOffset.y;
          runOnJS(scrollAllTo)(
            index,
            Math.min(event.contentOffset.y, headerHeight.value),
          );
        }
      },
      onMomentumEnd(event) {
        if (activeIndex === index) {
          scrollY.value = event.contentOffset.y;
          contentOffset.value = event.contentOffset.y;
          runOnJS(scrollAllTo)(
            index,
            Math.min(event.contentOffset.y, headerHeight.value),
          );
        }
      },
    },
    [index, activeIndex],
  );

  const dimensions = useWindowDimensions();

  const heightDimension = dimensions.height;
  const widthDimension = dimensions.width;
  const bottomSafeArea = safeArea.bottom;
  const heightOffsetStyle = useAnimatedStyle(() => {
    const s =
      heightDimension -
      (tabBarHeight - (LargeNavBarHeight + 50) - bottomSafeArea) -
      headerHeight.value -
      contentSize;

    return {
      width: widthDimension,
      minHeight: hasSpace.value ? s : 0,
    };
  });

  return (
    <Animated.ScrollView
      ref={ref}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: tabBarHeight }}
      {...props}
    >
      <Animated.View style={headerOffsetStyle} />
      <View
        onLayout={(ev) => {
          setContentSize(ev.nativeEvent.layout.height);
        }}
      >
        {props.children}
      </View>
      <Animated.View style={heightOffsetStyle} />
    </Animated.ScrollView>
  );
};
