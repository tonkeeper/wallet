

import React, { forwardRef, memo, useEffect, useRef } from 'react';
import Animated from 'react-native-reanimated';
import { ns, useMergeRefs } from '$utils';
import { useScreenScroll } from './context/ScreenScrollContext';
import { LargeNavBarHeight } from '$shared/constants';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { useBottomTabBarHeight } from '$hooks/useBottomTabBarHeight';

const AnimatedFlashList = Animated.createAnimatedComponent<React.ComponentType<FlashListProps<any>>>(
  FlashList
);

export const ScreenScrollList = memo<FlashListProps<any>>(forwardRef((props, ref) => {
  const tabBarHeight = useBottomTabBarHeight();
  const { contentScrollHandler, setScrollTo } = useScreenScroll();
  const flashListRef = useRef<FlashList<any>>(null);
  const setRef = useMergeRefs(ref, flashListRef);

  useEffect(() => {
    const scrollTo = (offset: number) => {
      flashListRef.current?.scrollToOffset({
        animated: true,
        offset
      })
    }

    setScrollTo(scrollTo);
  }, []);
  
  const contentContainerStyle = {
    paddingHorizontal: ns(16),
    paddingBottom: tabBarHeight,
    paddingTop: ns(LargeNavBarHeight),
  }
 
  return (
    <AnimatedFlashList
      onScroll={contentScrollHandler}
      ref={setRef}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
      horizontal={false}
      {...props}
    />
  );
}));
