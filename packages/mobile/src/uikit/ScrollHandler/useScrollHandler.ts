import React, { useCallback, useContext, useRef, useState } from 'react';
import { LargeNavBarInteractiveDistance } from '$uikit/LargeNavBar/LargeNavBar';
import {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';

import { ScrollPositionContext } from './ScrollPositionContext';

export const useScrollHandler = (snapOffset?: number, forceEnd?: boolean) => {
  const scrollRef = useRef<any>(null);
  const scrollTop = useSharedValue(0);
  const [isEnd, setEnd] = useState(true);
  const [isSnapPointReached, setSnapPointReached] = useState(false);
  const { changeEnd } = useContext(ScrollPositionContext);

  useScrollToTop(scrollRef);

  useFocusEffect(
    React.useCallback(() => {
      const end = forceEnd ? false : isEnd;
      changeEnd(end);
    }, [forceEnd, isEnd]),
  );

  const changeScrollOnJS = useCallback(
    (newPosition: number, contentHeight: number, containerHeight: number) => {
      const newEnd = newPosition + containerHeight >= Math.trunc(contentHeight);
      const end = forceEnd ? false : !newEnd
      changeEnd(end);
      setEnd(end);

      if (typeof snapOffset === 'number') {
        setSnapPointReached(newPosition >= snapOffset);
      }
    },
    [changeEnd, forceEnd, snapOffset],
  );

  const correctScrollHandler = useCallback(
    (top: number) => {
      if (top < LargeNavBarInteractiveDistance / 2) {
        scrollRef.current?.getScrollResponder()?.scrollTo({
          y: 0,
          animated: true,
        });
      } else {
        scrollRef.current?.getScrollResponder()?.scrollTo({
          y: LargeNavBarInteractiveDistance,
          animated: true,
        });
      }
    },
    [scrollRef],
  );

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        if (scrollTop.value !== event.contentOffset.y) {
          runOnJS(changeScrollOnJS)(
            event.contentOffset.y,
            event.contentSize.height,
            event.layoutMeasurement.height,
          );
        }
        
        scrollTop.value = event.contentOffset.y;        
      },
      onEndDrag(event) {
        const top = event.contentOffset.y;
        if (
          top > 0 &&
          top < LargeNavBarInteractiveDistance &&
          (!event.velocity || !event.velocity.y)
        ) {
          runOnJS(correctScrollHandler)(top);
        }
      },
      onMomentumEnd(event) {
        const top = event.contentOffset.y;
        if (
          top > 0 &&
          top < LargeNavBarInteractiveDistance &&
          event.velocity &&
          event.velocity.y !== 0
        ) {
          runOnJS(correctScrollHandler)(top);
        }
      },
    },
    [scrollRef, changeScrollOnJS, forceEnd],
  );

  return { isSnapPointReached, scrollRef, scrollTop, scrollHandler, changeScrollOnJS };
};
