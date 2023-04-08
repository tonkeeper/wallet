import Animated, { runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { ScreenLargeHeaderDistance } from '../Screen/ScreenLargeHeader';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { useScrollHandler } from '../ScrollHandler/useScrollHandler';
import { useBottomTabBarHeight } from '$hooks/useBottomTabBarHeight';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { useScrollToTop } from '@react-navigation/native';
import { useScreenScroll } from '$uikit/Screen/hooks';
import { usePagerView } from './hooks/usePagerView';
import { usePageIndex } from './hooks/usePageIndex';
import { useWindowDimensions } from 'react-native';
import { useMergeRefs } from '$utils';
import { throttle } from 'lodash';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export const PagerViewFlashList = memo<FlashListProps<any>>((props) => {
  const { contentContainerStyle } = props;
  const { activeIndex, scrollAllTo, setScrollTo, contentOffset, scrollY, headerHeight, isScrollInMomentum } = usePagerView();
  const { onScroll, detectContentSize, detectLayoutSize } = useScreenScroll();
  const tabBarHeight = useBottomTabBarHeight();
  const dimensions = useWindowDimensions();
  const ref = useRef<FlashList<any>>(null);
  const contentHeight = useSharedValue(0);
  const localScrollY = useSharedValue(0);
  const hasSpace = useSharedValue(true);
  const index = usePageIndex();

  const setRef = useMergeRefs(ref);

  useScrollToTop(ref as any);
  useScrollHandler(undefined, true); // TODO: remove this, when old separator will be removed
  
  const scrollToTopHandler = () => scrollAllTo(index, 0);

  useEffect(() => {
    setScrollTo(index, (y: number, animated?: boolean) => {
      hasSpace.value = true;
      requestAnimationFrame(() => {
        ref.current?.scrollToOffset({ offset: y, animated });
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
    const y = top > ScreenLargeHeaderDistance / 2 
      ? ScreenLargeHeaderDistance 
      : 0;
      
    requestAnimationFrame(() => {
      console.log(ref.current?.scrollToOffset);
      ref.current?.scrollToOffset({ offset: y, animated: true });
    });
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
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
            Math.min(event.contentOffset.y, headerHeight.value),
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
  }, [index, activeIndex.value]);

  const heightOffsetStyle = useAnimatedStyle(() => {
    return {
      height: hasSpace.value ? dimensions.height : 0,
      width: dimensions.width,
    };
  });

  const listStyle = useMemo(() => {
    const paddingBottom = tabBarHeight;
    return { ...contentContainerStyle, paddingBottom };
  }, [contentContainerStyle, tabBarHeight]);

  const headerOffsetStyle = useAnimatedStyle(() => ({
    height: headerHeight.value,
  }));

  const ListHeaderComponent = <Animated.View style={headerOffsetStyle} />;
  const ListFooterComponent = <Animated.View style={heightOffsetStyle} />;

  return (
    <AnimatedFlashList
      {...props}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      onContentSizeChange={detectContentSize}
      showsVerticalScrollIndicator={false}
      onScrollToTop={scrollToTopHandler}
      contentContainerStyle={listStyle}
      onLayout={detectLayoutSize}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      ref={setRef}
    />
  );
});
