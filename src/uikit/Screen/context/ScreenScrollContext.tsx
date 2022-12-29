import React, { createContext, memo, useCallback, useContext, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { LargeNavBarInteractiveDistance } from "$uikit/LargeNavBar/LargeNavBar";


type ScrollToFN = (offset: number) => void;

export type ScreenContext = {
  contentScrollY: Animated.SharedValue<number>;
  contentScrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  setScrollTo: (fn: ScrollToFN) => void;
}

export const ScreenScrollContext = createContext<ScreenContext | null>(null);


export const ScreenScrollProvider = memo((props) => {
  const contentScrollY = useSharedValue(0);

  const [isEnd, setEnd] = useState(true);
  const scrollToRef = useRef<ScrollToFN>();

  const setScrollTo = (scrollTo: ScrollToFN) => {
    scrollToRef.current = scrollTo;
  } 

  // const { changeEnd } = useContext(ScrollPositionContext);
  
  // useScrollToTop(scrollRef);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     changeEnd(isEnd);
  //   }, [changeEnd, isEnd]),
  // );

  const changeScrollOnJS = useCallback((
    newPosition: number, 
    contentHeight: number, 
    containerHeight: number
  ) => {
    const newEnd = newPosition + containerHeight >= contentHeight;
    // changeEnd(newEnd);
    // setEnd(newEnd);
  }, []);

  const correctScrollHandler = useCallback((top: number) => {
    const isTop = top < LargeNavBarInteractiveDistance / 2;
    const offset = isTop ? 0 : LargeNavBarInteractiveDistance;

    scrollToRef.current?.(offset);
  }, []);

  const contentScrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (event) => {
        contentScrollY.value = event.contentOffset.y;

        runOnJS(changeScrollOnJS)(
          event.contentOffset.y,
          event.contentSize.height,
          event.layoutMeasurement.height,
        );
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
    [],
  );

  const screenScrollContext = { 
    contentScrollHandler, 
    contentScrollY,
    setScrollTo
  };

  return (
    <ScreenScrollContext.Provider value={screenScrollContext}>
      {props.children}
    </ScreenScrollContext.Provider>
  )
});


export const useScreenScroll = () => {
  const ctx = useContext(ScreenScrollContext);

  if (!ctx) {
    throw new Error("Couldn't find a ScreenScrollContext. Have you wrapped 'Screen' component?");
  } 

  return ctx;
};