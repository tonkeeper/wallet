import React, { forwardRef, memo } from 'react';
import { ScrollViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { ns } from '$utils';
import { useScreenScroll } from './context/ScreenScrollContext';
import { useBottomTabBarHeight } from '$hooks/useBottomTabBarHeight';

interface ScreenScrollView extends ScrollViewProps {
  indent?: boolean;
}

export const ScreenScrollView = memo(forwardRef<Animated.ScrollView, ScreenScrollView>((props, ref) => {
  const { indent = true } = props;
  const tabBarHeight = useBottomTabBarHeight();
  const { scrollHandler } = useScreenScroll();
  
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
      onScroll={scrollHandler}
      ref={ref}
      {...props}
    >
      {props.children}
    </Animated.ScrollView>
  );
}));
