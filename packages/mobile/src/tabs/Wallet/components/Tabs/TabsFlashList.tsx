import React, { useCallback, useEffect, useRef } from 'react';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import Animated, { runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useTabCtx } from './TabsContainer';
import { useCurrentTab } from './TabsSection';
import { useScrollToTop } from '@react-navigation/native';
import { useScrollHandler } from '$uikit/ScrollHandler/useScrollHandler';
import { useBottomTabBarHeight } from '$hooks/useBottomTabBarHeight';
import { useWindowDimensions } from 'react-native';
import _ from 'lodash';
import { isAndroid } from '$utils';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export const TabsFlashList = (props: FlashListProps<any>) => {
  const { activeIndex, scrollAllTo, setScrollTo, headerOffsetStyle, contentOffset, scrollY, headerHeight, isScrollInMomentum } = useTabCtx();
  const ref = useRef<FlashList<any>>(null);
  const tabBarHeight = useBottomTabBarHeight();
  const dimensions = useWindowDimensions();
  const hasSpace = useSharedValue(true);
  const { index } = useCurrentTab();

  const { changeScrollOnJS } = useScrollHandler(undefined, activeIndex !== index);

  useScrollToTop(ref as any); // TODO: fix type

  useEffect(() => {
    setScrollTo(index, (y: number, animated?: boolean, withDelay?: boolean) => {
      hasSpace.value = true;
      requestAnimationFrame(() => {
        if (withDelay) {
          setTimeout(() => {
            ref.current?.scrollToOffset({ offset: y, animated })
          }, isAndroid ? 0 : 200);
        } else {
          ref.current?.scrollToOffset({ offset: y, animated })
        }
      });
    });
  }, []);
 
  const contentHeight = useSharedValue(0);

  const scrollAdjacentTabs = _.throttle((index, y) => {
    runOnJS(scrollAllTo)(index, y);
  }, 200);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll(event) {
      contentHeight.value = event.layoutMeasurement.height;

      if (activeIndex === index) {
        contentOffset.value = 0;
        scrollY.value = event.contentOffset.y;
        hasSpace.value = false;

        if (isAndroid && event.contentOffset.y >= 0) {
          runOnJS(scrollAdjacentTabs)(index, Math.min(event.contentOffset.y, headerHeight.value));
        }

        runOnJS(changeScrollOnJS)(
          event.contentOffset.y,
          event.contentSize.height,
          event.layoutMeasurement.height,
        );
      }
    },
    onMomentumBegin() {
      if (activeIndex === index) {
        isScrollInMomentum.value = true;
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
        isScrollInMomentum.value = false;
        scrollY.value = event.contentOffset.y;
        contentOffset.value = event.contentOffset.y;
        runOnJS(scrollAllTo)(index, Math.min(event.contentOffset.y, headerHeight.value));
      }
    },
  }, [index, activeIndex]);
  
  // TODO: fix it
  const heightOffsetStyle = useAnimatedStyle(() => {
    const s = dimensions.height;// - contentHeight.value

    return { 
      width: dimensions.width,
      height: hasSpace.value ? s : 0
    }
  });

  const handleScrollToTop = useCallback(() => {
    scrollAllTo(index, 0);
  }, [index]);

  return (
    <AnimatedFlashList 
      onScrollToTop={handleScrollToTop}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      ref={ref}
      {...props}
      ListHeaderComponent={
        <>
          <Animated.View style={headerOffsetStyle}/>
          {props.ListHeaderComponent}
        </>
      }
      ListFooterComponent={
        <Animated.View style={heightOffsetStyle}/>
      }
      contentContainerStyle={{ paddingBottom: tabBarHeight + 8, ...props.contentContainerStyle }}
    />
  );
};
