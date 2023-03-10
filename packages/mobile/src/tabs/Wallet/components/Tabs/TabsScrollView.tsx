import React, { useEffect, useRef, useState } from 'react';
import Animated, { runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useTabCtx } from './TabsContainer';
import { ScrollViewProps, useWindowDimensions, View } from 'react-native';
import { useCurrentTab } from './TabsSection';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LargeNavBarHeight } from '$shared/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabsScrollViewProps extends ScrollViewProps{

}

const useWrapBottomTabBarHeight = () => {
  try { // Fix crash 
    return useBottomTabBarHeight();
  } catch (err) {
    return 0;
  }  
}

export const TabsScrollView = (props: TabsScrollViewProps) => {
  const { activeIndex, scrollAllTo, setScrollTo, headerOffsetStyle, contentOffset, scrollY, headerHeight } = useTabCtx();
  const { index } = useCurrentTab();
  const tabBarHeight = useBottomTabBarHeight();
  const [contentSize, setContentSize] = useState(0);
  const safeArea = useSafeAreaInsets();
  
  const ref = useRef<Animated.ScrollView>(null);

  const localScrollY = useSharedValue(0);
  const hasSpace = useSharedValue(true);

  const scrollTo = React.useCallback((y: number, animated?: boolean) => {
    hasSpace.value = true;

    setTimeout(() => {
      // const correctY = Math.min(contentSize, y);
      ref.current?.scrollTo({ y: y, animated });
    }, 200);
  }, [contentSize]);

  useEffect(() => {
    setScrollTo(index, scrollTo);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll(event) {
      localScrollY.value = event.contentOffset.y
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
    const s = dimensions.height - (tabBarHeight - (LargeNavBarHeight + 50)  - safeArea.bottom) - headerHeight.value - contentSize

    return {
      // backgroundColor: 'red',
      width: dimensions.width,
      minHeight: hasSpace.value ? s : 0
    }
  })
  
  return (
    <Animated.ScrollView 
      ref={ref}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      // onContentSizeChange={(w, h) => setContentSize(h)}
      contentContainerStyle={{ paddingBottom: tabBarHeight }}
      {...props}
    >
      <Animated.View style={headerOffsetStyle} />
      <View
        onLayout={(ev) => {
          setContentSize(ev.nativeEvent.layout.height);
        }}
      >
        {props.children}
      </View>
      <Animated.View style={heightOffsetStyle}/>
    </Animated.ScrollView>
  );
};
