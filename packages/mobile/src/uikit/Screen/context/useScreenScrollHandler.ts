import { useCallback, useRef } from 'react';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { useScrollToTop } from '@react-navigation/native';
import { LayoutChangeEvent } from 'react-native';

export type ScrollRefComponents = FlashList<any> | Animated.ScrollView;

export type ScrollRef<T = ScrollRefComponents> = React.RefObject<T>;

type ScrollOptions = { x?: number; y?: number; animated?: boolean };

type ScrollableView =
  | { scrollToTop(): void }
  | { scrollTo(options: ScrollOptions): void }
  | { scrollToOffset(options: { offset?: number; animated?: boolean }): void }
  | { scrollResponderScrollTo(options: ScrollOptions): void };

export type ScrollableWrapper =
  | { getScrollResponder(): React.ReactNode }
  | { getNode(): ScrollableView }
  | ScrollableView;

export const useScreenScrollHandler = () => {
  const scrollRef = useRef<ScrollableWrapper>(null);
  const isContentSizeDetected = useRef(false);
  const isEndReached = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const layoutHeight = useRef(0);

  useScrollToTop(scrollRef);

  const detectLayoutSize = useCallback((ev: LayoutChangeEvent) => {
    layoutHeight.current = ev.nativeEvent.layout.height;
  }, []);

  const detectContentSize = useCallback((_: number, h: number) => {
    if (h > 1) {
      if (!isContentSizeDetected.current && layoutHeight.current > 0) {
        const contentLessContainer =  h < layoutHeight.current;
        isEndReached.value = contentLessContainer ? 0 : 1;
        isContentSizeDetected.current = true;
      }
    }
  }, []);

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        if (scrollY.value !== event.contentOffset.y) {
          // Detect scroll end
          const y = event.contentOffset.y;
          const containerHeight = event.layoutMeasurement.height;
          const contentHeight = event.contentSize.height;

          const endReached = y + containerHeight >= Math.trunc(contentHeight);
          isEndReached.value = !endReached ? 1 : 0;
        }

        scrollY.value = event.contentOffset.y;
      },
      // onEndDrag(event) {
      //   const top = event.contentOffset.y;
      //   if (
      //     top > 0 &&
      //     top < LargeNavBarInteractiveDistance &&
      //     (!event.velocity || !event.velocity.y)
      //   ) {
      //     runOnJS(correctScrollHandler)(top);
      //   }
      // },
      // onMomentumEnd(event) {
      //   const top = event.contentOffset.y;
      //   if (
      //     top > 0 &&
      //     top < LargeNavBarInteractiveDistance &&
      //     event.velocity &&
      //     event.velocity.y !== 0
      //   ) {
      //     runOnJS(correctScrollHandler)(top);
      //   }
      // },
    },
    [],
  );

  return {
    detectContentSize,
    detectLayoutSize,
    scrollHandler,
    isEndReached,
    scrollRef,
    scrollY,
  };
};
