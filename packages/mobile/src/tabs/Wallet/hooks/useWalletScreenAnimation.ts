import { NavBarHeight } from "$shared/constants";
import { statusBarHeight } from "$utils";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React from "react";
import { ScrollView, ScrollViewProps } from "react-native";
import Animated, { AnimateProps, runOnJS, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";



export const useWalletScreenAnimation = () => {
  const stickyTabBar = useSharedValue(0);
  
  const positions = React.useRef<{ [key in string]: number }>({});
  const contentWidth = React.useRef<{ [key in string]: number }>({});

  
const balanceHeight = useSharedValue(0);
  

  return {
   
  };
};
