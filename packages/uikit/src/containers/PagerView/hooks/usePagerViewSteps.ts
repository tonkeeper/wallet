import { PagerViewRef, PagerViewSelectedEvent } from '../PagerViewProvider';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { useRouter } from '@tonkeeper/router';

export const usePagerViewSteps = (initialPageIndex: number = 0) => {
  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const pagerViewRef = useRef<PagerViewRef>(null);
  const pageOffset = useSharedValue(0);
  const router = useRouter();

  const onBackPress = useCallback(() => {
    if (pageIndex !== 0) {
      pagerViewRef.current?.setPage(pageIndex - 1);
    } else {
      router.goBack();
    }
  }, [pageIndex]);

  const next = useCallback(() => {
    pagerViewRef.current?.setPage(pageIndex + 1);
  }, [pageIndex]);

  const onPageSelected = useCallback((ev: PagerViewSelectedEvent) => {
    const index = ev.nativeEvent.position;
    router.setOptions({ gestureEnabled: index === 0 });
    setPageIndex(index);
  }, []);

  return {
    next,
    onBackPress,
    pageIndex,
    props: useMemo(
      () => ({
        pageOffset,
        disableRightScroll: true,
        ref: pagerViewRef,
        initialPageIndex,
        overdrag: false,
        onPageSelected,
      }),
      [],
    ),
  };
};
