import React, { useEffect, useRef } from 'react';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTabCtx } from './TabsContainer';
import { useCurrentTab } from './TabsSection';
import { useScrollToTop } from '@react-navigation/native';
import { useScrollHandler } from '$uikit/ScrollHandler/useScrollHandler';
import { useBottomTabBarHeight } from '$hooks/useBottomTabBarHeight';
import { NavBarHeight } from '$shared/constants';

interface TabsFlashListProps<TItem> extends FlashListProps<TItem> {

}

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export const TabsFlashList = <TItem extends any>(props: TabsFlashListProps<TItem>) => {
  const { activeIndex, scrollAllTo, setScrollTo, headerOffsetStyle, contentOffset, scrollY, headerHeight, correctIntermediateHeaderState } = useTabCtx();
  const { index } = useCurrentTab();
  const ref = useRef<FlashList<any>>(null);
  const tabBarHeight = useBottomTabBarHeight();

  const { changeScrollOnJS } = useScrollHandler();

  useScrollToTop(ref as any); // TODO: fix type

  useEffect(() => {
    setScrollTo(index, (y: number, animated?: boolean) => {
      ref.current?.scrollToOffset({ offset: y, animated })
    });
  }, []);
 
  const contentHeight = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll(event) {
      contentHeight.value = event.layoutMeasurement.height;
      if (activeIndex === index) {
        contentOffset.value = 0;
        scrollY.value = event.contentOffset.y;

        runOnJS(changeScrollOnJS)(
          event.contentOffset.y,
          event.contentSize.height,
          event.layoutMeasurement.height,
        );
      }
    },
    onEndDrag(event) {
      if (activeIndex === index) {
        scrollY.value = event.contentOffset.y;
        contentOffset.value = event.contentOffset.y;
        
        runOnJS(scrollAllTo)(index, Math.min(event.contentOffset.y, headerHeight.value));
      }
    },
    onMomentumEnd(event) {
      if (activeIndex === index) {
        scrollY.value = event.contentOffset.y;
        contentOffset.value = event.contentOffset.y;
        runOnJS(scrollAllTo)(index, Math.min(event.contentOffset.y, headerHeight.value));
      }
    },
    
  }, [index, activeIndex]);
  
  return (
    <AnimatedFlashList 
      ref={ref}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      ListHeaderComponent={
        <Animated.View style={headerOffsetStyle}/>
      }
      // ListFooterComponent={() => (
      //   <Animated.View style={{ height: tabBarHeight }}/>
      // )}
      {...props}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 8, ...props.contentContainerStyle }}
    />
  );
};
