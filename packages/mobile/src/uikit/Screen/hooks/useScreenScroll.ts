import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { createContext, useCallback, useRef, useContext } from 'react';
import { LayoutChangeEvent, NativeScrollEvent } from 'react-native';
import { FlashList } from '@shopify/flash-list';

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
  const headerEjectionPoint = useSharedValue(0);
  const scrollRef = useRef<ScrollableWrapper>(null);
  const isContentSizeDetected = useRef(false);
  const isEndReached = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const layoutHeight = useRef(0);

  const detectLayoutSize = useCallback((ev: LayoutChangeEvent) => {
    layoutHeight.current = ev.nativeEvent.layout.height;
  }, []);

  const detectContentSize = useCallback((_: number, h: number) => {
    if (h > 1) {
      if (!isContentSizeDetected.current && layoutHeight.current > 0) {
        const contentLessContainer = h < layoutHeight.current;
        isEndReached.value = contentLessContainer ? 0 : 1;
        isContentSizeDetected.current = true;
      }
    }
  }, []);

  const onScroll = (event: NativeScrollEvent) => {
    'worklet';
    if (scrollY.value !== event.contentOffset.y) {
      // Detect scroll end
      const y = event.contentOffset.y;
      const containerHeight = event.layoutMeasurement.height;
      const contentHeight = event.contentSize.height;

      const endReached = y + containerHeight >= Math.trunc(contentHeight);
      isEndReached.value = !endReached ? 1 : 0;
    }

    scrollY.value = event.contentOffset.y;
  };

  const onMomentumEnd = (event: NativeScrollEvent) => {
    'worklet';
    // const top = event.contentOffset.y;
    // if (
    //   top > 0 &&
    //   top < LargeNavBarInteractiveDistance &&
    //   event.velocity &&
    //   event.velocity.y !== 0
    // ) {
    //   runOnJS(correctScrollHandler)(top);
    // }
  };

  const onEndDrag = (event: NativeScrollEvent) => {
    'worklet';
    // const top = event.contentOffset.y;
    // if (
    //   top > 0 &&
    //   top < LargeNavBarInteractiveDistance &&
    //   (!event.velocity || !event.velocity.y)
    // ) {
    //   runOnJS(correctScrollHandler)(top);
    // }
  }

  const scrollHandler = useAnimatedScrollHandler({
    onMomentumEnd,
    onEndDrag,
    onScroll,
  }, []);

  return {
    headerEjectionPoint,
    detectContentSize,
    detectLayoutSize,
    scrollHandler,
    onScroll,
    isEndReached,
    scrollRef,
    scrollY,
  };
};

type IScreenScrollContext = ReturnType<typeof useScreenScrollHandler> | null;
export const ScreenScrollContext = createContext<IScreenScrollContext>(null);

export const useScreenScroll = () => {
  const screenScroll = useContext(ScreenScrollContext);

  if (!screenScroll) {
    throw new Error('No ScreenScrollContext');
  }

  return screenScroll;
};
