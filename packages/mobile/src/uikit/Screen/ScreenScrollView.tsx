import React from 'react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { ScrollViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { ns } from '$utils';
import { ScrollHandler } from '../ScrollHandler/ScrollHandler';

const useWrapBottomTabBarHeight = () => {
  try { // Fix crash 
    return useBottomTabBarHeight();
  } catch (err) {
    return 0;
  }  
}

export const ScreenScrollView: React.FC<ScrollViewProps> = (props) => {
  const tabBarHeight = useWrapBottomTabBarHeight();
  const contentContainerStyle = [
    {
      paddingHorizontal: ns(16),
      paddingBottom: tabBarHeight, // Why ?
    }, 
    props.style
  ];

  return (
    <ScrollHandler>
      <Animated.ScrollView
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        {...props}
      >
        {props.children}
      </Animated.ScrollView>
    </ScrollHandler>
  );
};
