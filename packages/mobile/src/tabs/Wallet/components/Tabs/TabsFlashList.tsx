import React, { useEffect, useRef } from 'react';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTabCtx } from './TabsContainer';
import { useCurrentTab } from './TabsSection';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

interface TabsFlashListProps<TItem> extends FlashListProps<TItem> {

}

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

const useWrapBottomTabBarHeight = () => {
  try { // Fix crash 
    return useBottomTabBarHeight();
  } catch (err) {
    return 0;
  }  
}

export const TabsFlashList = <TItem extends any>(props: TabsFlashListProps<TItem>) => {
  const { activeIndex, scrollAllTo, setScrollTo, headerOffsetStyle, contentOffset, scrollY, headerHeight } = useTabCtx();
  const { index } = useCurrentTab();
  const ref = useRef<FlashList<any>>(null);
  const tabBarHeight = useWrapBottomTabBarHeight();

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
      }
    },
    onEndDrag(event) {
      if (activeIndex === index) {
        scrollY.value = event.contentOffset.y;
        contentOffset.value = event.contentOffset.y;
        runOnJS(scrollAllTo)(index, event.contentOffset.y);
      }
    },
    onMomentumEnd(event, context) {
      if (activeIndex === index) {
        scrollY.value = event.contentOffset.y;
        contentOffset.value = event.contentOffset.y;
        runOnJS(scrollAllTo)(index, event.contentOffset.y);
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
      contentContainerStyle={{ paddingBottom: tabBarHeight + 24, ...props.contentContainerStyle }}
    />
  );
};
