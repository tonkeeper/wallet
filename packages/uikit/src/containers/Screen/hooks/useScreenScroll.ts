import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { ScreenLargeHeaderDistance, ScreenLargeHeaderHeight } from '../utils/constants';
import { ScrollableWrapper, getScrollTo, getScrollableNode } from '../utils/scrollable';
import { createContext, useCallback, useRef, useContext } from 'react';
import { LayoutChangeEvent, NativeScrollEvent } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useValueRef } from '../../../../hooks/useValueRef';

export type ScrollRefComponents = FlashList<any> | Animated.ScrollView;
export type ScrollRef<T = ScrollRefComponents> = React.RefObject<T>;
export type HeaderTypes = 'normal' | 'large';

export const useScreenScrollHandler = () => {
  const headerType = useValueRef<HeaderTypes>('normal');
  const scrollRef = useRef<ScrollableWrapper>(null);
  const headerEjectionPoint = useSharedValue(0);
  const isContentSizeDetected = useRef(false);
  const isEndReached = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const layoutHeight = useRef(0);

  const defineHeaderType = headerType.setValue;

  const headerOffsetStyle = useAnimatedStyle(
    () => ({
      height: headerType.value === 'large' ? ScreenLargeHeaderHeight : 0,
    }),
    [headerType.value],
  );

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

  const correctLargeHeader = useCallback((top: number) => {
    const scrollNode = getScrollableNode(scrollRef);
    const scrollTo = getScrollTo(scrollNode);

    const y = top > ScreenLargeHeaderDistance / 2 ? ScreenLargeHeaderDistance : 0;

    requestAnimationFrame(() => {
      scrollTo({ y, animated: true });
    });
  }, []);

  const onMomentumEnd = (event: NativeScrollEvent) => {
    'worklet';
    const top = event.contentOffset.y;
    if (
      top > 0 &&
      top < ScreenLargeHeaderDistance &&
      event.velocity &&
      event.velocity.y !== 0
    ) {
      runOnJS(correctLargeHeader)(top);
    }
  };

  const onEndDrag = (event: NativeScrollEvent) => {
    'worklet';
    const top = event.contentOffset.y;
    if (
      top > 0 &&
      top < ScreenLargeHeaderDistance &&
      (!event.velocity || !event.velocity.y)
    ) {
      runOnJS(correctLargeHeader)(top);
    }
  };

  const scrollHandler = useAnimatedScrollHandler(
    {
      onMomentumEnd,
      onEndDrag,
      onScroll,
    },
    [],
  );

  return {
    headerType: headerType.value,
    headerEjectionPoint,
    headerOffsetStyle,
    isEndReached,
    scrollRef,
    scrollY,
    detectContentSize,
    defineHeaderType,
    detectLayoutSize,
    scrollHandler,
    onMomentumEnd,
    onEndDrag,
    onScroll,
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
