import React, { useEffect, useRef } from 'react';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useTabCtx } from './TabsContainer';
import { useCurrentTab } from './TabsSection';

interface TabsFlashListProps<TItem> extends FlashListProps<TItem> {

}

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export const TabsFlashList = <TItem extends any>(props: TabsFlashListProps<TItem>) => {
  const { activeIndex, scrollAllTo, setScrollTo, headerOffsetStyle, contentOffset, scrollY, headerHeight } = useTabCtx();
  const { index } = useCurrentTab();
  const ref = useRef<FlashList<any>>(null);

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
        console.log('end', index);
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
      {...props}
    />
  );
};
