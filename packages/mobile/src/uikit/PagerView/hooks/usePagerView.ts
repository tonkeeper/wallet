import { createContext, useCallback, useRef, useContext, useEffect } from 'react';
import { usePagerScrollHandler } from './usePagerScrollHandler';
import { useSharedValue } from 'react-native-reanimated';
import { useScreenScroll } from '$uikit/Screen/hooks';
import { LayoutChangeEvent } from 'react-native';
import PagerView from 'react-native-pager-view';
import { ns } from '$utils';

export const tabIndicatorWidth = ns(24);

// type ScrollToParams = { y: number, animated?: boolean };
// type ScrollTo = (params: ScrollToParams) => void;
type ScrollTo = (y: number, animated?: boolean) => void;

export const usePagerViewHandler = () => {
  const { headerEjectionPoint } = useScreenScroll();
  const isScrollInMomentum = useSharedValue(false);
  const pagerViewRef = useRef<PagerView>(null);
  const contentOffset = useSharedValue(0);
  const headerHeight = useSharedValue(0);
  const activeIndex = useSharedValue(0);
  const pageOffset = useSharedValue(0);
  const scrollY = useSharedValue(0);


  const measureHeader = (event: LayoutChangeEvent) => {
    headerEjectionPoint.value = event.nativeEvent.layout.height;
    headerHeight.value = event.nativeEvent.layout.height;
  };

  useEffect(() => {
    return () => {
      headerEjectionPoint.value = 0;
    };
  }, []);

  const refs = useRef<{ [key in string]: ScrollTo }>({});
  const setScrollTo = useCallback((index: number, scrollTo: ScrollTo) => {
    refs.current[`scroll-${index}`] = scrollTo;
  }, []);

  const scrollByIndex = (
    index: number,
    opts: { y?: number; animated?: boolean } = {},
  ) => {
    const scrollTo = refs.current[`scroll-${index}`];
    if (scrollTo) {
      const y = opts.y !== undefined ? opts.y : scrollY.value;
      const animated = opts.animated !== undefined ? opts.animated : false;
      scrollTo(y, animated);
    }
  };

  const scrollAllTo = (currentIndex: number, y: number) => {
    Object.values(refs.current).forEach((scrollTo, index) => {
      if (index !== currentIndex) {
        scrollTo(y, false);
      }
    });
  };

  const setPage = useCallback(
    (index: number) => {
      if (!isScrollInMomentum.value) {
        if (index === activeIndex.value && scrollY.value > headerHeight.value) {
          scrollByIndex(index, {
            y: headerHeight.value,
            animated: true,
          });
        }

        requestAnimationFrame(() => pagerViewRef.current?.setPage(index));
      }
    },
    [activeIndex.value],
  );

  const horizontalScrollHandler = usePagerScrollHandler({
    onPageScroll: (event) => {
      'worklet';
      pageOffset.value = event.offset + event.position;
      activeIndex.value = Math.abs(event.position);
    },
  });

  return {
    horizontalScrollHandler,
    measureHeader,
    scrollByIndex,
    setScrollTo,
    scrollAllTo,
    setPage,
    isScrollInMomentum,
    contentOffset,
    headerHeight,
    pagerViewRef,
    activeIndex,
    pageOffset,
    scrollY,
  };
};

type IPagerViewContext = ReturnType<typeof usePagerViewHandler> | null;
export const PagerViewContext = createContext<IPagerViewContext>(null);

export const usePagerView = () => {
  const pagerView = useContext(PagerViewContext);

  if (!pagerView) {
    throw new Error('No PagerViewContext');
  }

  return pagerView;
};
