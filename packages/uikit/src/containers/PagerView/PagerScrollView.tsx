import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { ScrollView, ScrollViewProps, useWindowDimensions } from 'react-native';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { ScreenLargeHeaderDistance } from '../Screen/utils/constants';
import { useBottomTabBarHeight } from '@tonkeeper/router';
import { useScrollToTop } from '@react-navigation/native';
import { usePagerView } from './hooks/usePagerView';
import { usePageIndex } from './hooks/usePageIndex';
import { useScreenScroll } from '../Screen/hooks';
import { useMergeRefs } from '../../utils';
import { throttle } from 'lodash';

export const PagerViewScrollView = memo<ScrollViewProps>((props) => {
  const { contentContainerStyle, children } = props;
  const {
    activeIndex,
    scrollAllTo,
    setScrollTo,
    contentOffset,
    scrollY,
    headerHeight,
    isScrollInMomentum,
  } = usePagerView();
  const { onScroll, detectContentSize, detectLayoutSize } = useScreenScroll();
  const tabBarHeight = useBottomTabBarHeight();
  const dimensions = useWindowDimensions();
  const ref = useRef<ScrollView>(null);
  const contentHeight = useSharedValue(0);
  const localScrollY = useSharedValue(0);
  const hasSpace = useSharedValue(true);
  const index = usePageIndex();

  const setRef = useMergeRefs(ref);

  useScrollToTop(ref as any);
  // useScrollHandler(undefined, true); // TODO: remove this, when old separator will be removed

  const scrollToTopHandler = () => scrollAllTo(index, 0);

  useEffect(() => {
    setScrollTo(index, (y: number, animated?: boolean) => {
      hasSpace.value = true;
      requestAnimationFrame(() => {
        ref.current?.scrollTo({ y, animated });
      });
    });
  }, []);

  const prevThrottleScrollY = useSharedValue(0);
  const scrollAdjacentTabs = throttle((y, index) => {
    if (prevThrottleScrollY.value !== y) {
      runOnJS(scrollAllTo)(index, y);
      prevThrottleScrollY.value = y;
    }
  }, 200);

  const correctLargeHeader = useCallback((top: number) => {
    const y = top > ScreenLargeHeaderDistance / 2 ? ScreenLargeHeaderDistance : 0;

    requestAnimationFrame(() => {
      ref.current?.scrollTo({ y, animated: true });
    });
  }, []);

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        'worklet';
        contentHeight.value = event.layoutMeasurement.height;
        if (activeIndex.value === index) {
          const scrollOffset = event.contentOffset.y;
          localScrollY.value = scrollOffset;
          scrollY.value = scrollOffset;

          contentOffset.value = 0;
          hasSpace.value = false;

          onScroll(event);

          if (event.contentOffset.y >= 0) {
            runOnJS(scrollAdjacentTabs)(
              Math.min(event.contentOffset.y, headerHeight),
              index,
            );
          }
        }
      },
      onMomentumBegin: () => {
        'worklet';
        if (activeIndex.value === index) {
          isScrollInMomentum.value = true;
        }
      },
      onMomentumEnd: (event) => {
        'worklet';
        if (activeIndex.value === index) {
          isScrollInMomentum.value = false;

          const top = event.contentOffset.y;
          if (
            top > 0 &&
            top < ScreenLargeHeaderDistance &&
            event.velocity &&
            event.velocity.y !== 0
          ) {
            runOnJS(correctLargeHeader)(top);
          }
        }
      },
      onEndDrag: (event) => {
        'worklet';
        const top = event.contentOffset.y;
        if (
          top > 0 &&
          top < ScreenLargeHeaderDistance &&
          (!event.velocity || !event.velocity.y)
        ) {
          runOnJS(correctLargeHeader)(top);
        }
      },
    },
    [index, activeIndex.value],
  );

  const heightOffsetStyle = useAnimatedStyle(() => {
    return {
      height: hasSpace.value ? dimensions.height : 0,
      width: dimensions.width,
    };
  });

  const listStyle = useMemo(() => {
    const paddingBottom = 0; //tabBarHeight;
    return [{ paddingBottom }, contentContainerStyle];
  }, [contentContainerStyle, tabBarHeight]);

  const headerOffsetStyle = useAnimatedStyle(() => ({
    height: headerHeight,
  }));

  const ListHeaderComponent = <Animated.View style={headerOffsetStyle} />;
  const ListFooterComponent = <Animated.View style={heightOffsetStyle} />;

  return (
    <Animated.ScrollView
      // ListHeaderComponent={ListHeaderComponent}
      // ListFooterComponent={ListFooterComponent}
      onScrollToTop={scrollToTopHandler}
      onLayout={detectLayoutSize}
      contentContainerStyle={listStyle}
      onContentSizeChange={detectContentSize}
      showsVerticalScrollIndicator={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      ref={setRef}
    >
      {children}
    </Animated.ScrollView>
  );
});
