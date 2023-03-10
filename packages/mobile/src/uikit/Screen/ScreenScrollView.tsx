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

interface ScreenScrollView extends ScrollViewProps {
  indent?: boolean;
}

export const ScreenScrollView = memo(forwardRef<Animated.ScrollView, ScreenScrollView>((props, ref) => {
  const { indent = true } = props;
  const tabBarHeight = useWrapBottomTabBarHeight();
  const { contentScrollHandler } = useScreenScroll();
  
  const contentContainerStyle = [
    {
      ...(indent && { paddingHorizontal: ns(16) }),
      paddingBottom: tabBarHeight,
      // paddingTop: ns(NavBarHeight),
    }, 
    props.contentContainerStyle
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
