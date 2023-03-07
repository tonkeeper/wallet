import React, { useEffect, useRef, useState } from 'react';
import Animated, { runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useTabCtx } from './TabsContainer';
import { ScrollViewProps, useWindowDimensions } from 'react-native';
import { useCurrentTab } from './TabsSection';

interface TabsScrollViewProps extends ScrollViewProps{

}

export const TabsScrollView = (props: TabsScrollViewProps) => {
  const { activeIndex, scrollAllTo, setScrollTo, headerOffsetStyle, contentOffset, scrollY, headerHeight } = useTabCtx();
  const { index } = useCurrentTab();
  
  const ref = useRef<Animated.ScrollView>(null);

  const localScrollY = useSharedValue(0);
  const hasSpace = useSharedValue(true);

  const scrollTo = (y: number, animated?: boolean) => {
    hasSpace.value = true;

    setTimeout(() =>{
      ref.current?.scrollTo({ y, animated });
    }, 200);
  }

  useEffect(() => {
    setScrollTo(index, scrollTo);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll(event) {
      localScrollY.value = event.contentOffset.y
      console.log(localScrollY.value);
      if (activeIndex === index) {
        contentOffset.value = 0;
        scrollY.value = event.contentOffset.y;
        hasSpace.value = false;
      }
    },
    onEndDrag(event) {
      if (activeIndex === index) {
        scrollY.value = event.contentOffset.y;
        contentOffset.value = event.contentOffset.y;
        runOnJS(scrollAllTo)(index, event.contentOffset.y);
      }
    },
    onMomentumEnd(event) {
      if (activeIndex === index) {
        scrollY.value = event.contentOffset.y;
        contentOffset.value = event.contentOffset.y;
        runOnJS(scrollAllTo)(index, event.contentOffset.y);
      }
    },
    
  }, [index, activeIndex]);

  const dimensions = useWindowDimensions();

  const heightOffsetStyle = useAnimatedStyle(() => {
    return {
      // backgroundColor: 'red',
      width: dimensions.width,
      minHeight: hasSpace.value ? dimensions.height : 0
    }
  })
  

  const [_, setContentSize] = useState(0);
 
  return (
    <Animated.ScrollView 
      ref={ref}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      onContentSizeChange={(w, h) => setContentSize(h)}
      {...props}
    >
      <Animated.View style={headerOffsetStyle} />
      {props.children}
      <Animated.View style={heightOffsetStyle}/>
    </Animated.ScrollView>
  );
};
