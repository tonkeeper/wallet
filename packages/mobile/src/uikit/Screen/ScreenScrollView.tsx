import React, { forwardRef, memo } from 'react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ScrollViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { ns } from '$utils';
import { useScreenScroll } from './context/ScreenScrollContext';
import { LargeNavBarHeight, NavBarHeight } from '$shared/constants';

const useWrapBottomTabBarHeight = () => {
  try { // Fix crash 
    return useBottomTabBarHeight();
  } catch (err) {
    return 0;
  }  
}

export const ScreenScrollView = memo(forwardRef<Animated.ScrollView, ScrollViewProps>((props, ref) => {
  const tabBarHeight = useWrapBottomTabBarHeight();
  const { contentScrollHandler } = useScreenScroll();
  
  const contentContainerStyle = [
    {
      paddingHorizontal: ns(16),
      paddingBottom: tabBarHeight,
      // paddingTop: ns(NavBarHeight),
    }, 
    props.style
  ];

  return (
    <Animated.ScrollView
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={contentScrollHandler}
      ref={ref}
      {...props}
    >
      {props.children}
    </Animated.ScrollView>
  );
}));
