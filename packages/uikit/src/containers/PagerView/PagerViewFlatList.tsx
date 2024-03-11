import { FlatList, FlatListProps, useWindowDimensions, View } from 'react-native';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { ScreenLargeHeaderDistance } from '../Screen/utils/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@tonkeeper/router';
import { useScrollToTop } from '@react-navigation/native';
import { usePagerView } from './hooks/usePagerView';
import { usePageIndex } from './hooks/usePageIndex';
import { useScreenScroll } from '../Screen/hooks';
import { Steezy, StyleProp } from '../../styles';
import { useMergeRefs } from '../../utils';
import { throttle } from 'lodash';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';

const { useStyle } = Steezy;

type StyledFlatListProps<TItem> = Omit<FlatListProps<TItem>, 'contentContainerStyle'> & {
  contentContainerStyle?: StyleProp;
};

function PagerViewFlatListComponent<TItem>(props: StyledFlatListProps<TItem>) {
  const { contentContainerStyle } = props;
  const { onScroll, detectContentSize, detectLayoutSize } = useScreenScroll();
  const style = useStyle(contentContainerStyle);
  const tabBarHeight = useBottomTabBarHeight();
  const safeArea = useSafeAreaInsets();
  const dimensions = useWindowDimensions();
  const ref = useRef<FlatList<TItem>>(null);
  const contentHeight = useSharedValue(0);
  const localScrollY = useSharedValue(0);
  const hasSpace = useSharedValue(true);
  const index = usePageIndex();
  const {
    isScrollInMomentum,
    contentOffset,
    headerHeight,
    activeIndex,
    scrollAllTo,
    setScrollTo,
    scrollY,
  } = usePagerView();

  const setRef = useMergeRefs(ref);

  useScrollToTop(ref as any);

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
    const y = top > ScreenLargeHeaderDistance / 2 ? ScreenLargeHeaderDistance : 0;

    requestAnimationFrame(() => {
      ref.current?.scrollToOffset({ offset: y, animated: true });
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
    [index, activeIndex.value, headerHeight],
  );

  const heightOffsetStyle = useAnimatedStyle(() => {
    return {
      height: hasSpace.value ? dimensions.height : 0,
      width: dimensions.width,
    };
  }, [hasSpace.value, dimensions.height, dimensions.width]);

  const ListHeaderComponent = useMemo(
    () => <View style={{ height: headerHeight }} />,
    [headerHeight],
  );
  const ListFooterComponent = useMemo(
    () => <Animated.View style={heightOffsetStyle} />,
    [heightOffsetStyle],
  );

  const listStyle = useMemo(() => {
    const paddingBottom = tabBarHeight === 0 ? safeArea.bottom : tabBarHeight;

    if (style !== undefined) {
      return [style, { paddingBottom }];
    } else {
      return { paddingBottom };
    }
  }, [style, tabBarHeight]);

  return (
    <Animated.FlatList
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
}

export const PagerViewFlatList = memo(PagerViewFlatListComponent);
