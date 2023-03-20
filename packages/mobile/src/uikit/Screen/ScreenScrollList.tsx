

import React, { forwardRef, memo, useMemo, useRef } from 'react';
import Animated from 'react-native-reanimated';
import { ns, useMergeRefs } from '$utils';
import { ContentStyle, FlashList, FlashListProps } from '@shopify/flash-list';
import { useBottomTabBarHeight } from '$hooks/useBottomTabBarHeight';
import { useScrollHandler } from '$uikit/ScrollHandler/useScrollHandler';
import { StyleSheet, View } from 'react-native';

const AnimatedFlashList = Animated.createAnimatedComponent<React.ComponentType<FlashListProps<any>>>(
  FlashList
);

export const ScreenScrollList = memo<FlashListProps<any>>(forwardRef((props, ref) => {
  const { contentContainerStyle, ...other } = props;
  const tabBarHeight = useBottomTabBarHeight();
  const { scrollHandler } = useScrollHandler();
  const flashListRef = useRef<FlashList<any>>(null);
  const setRef = useMergeRefs(ref, flashListRef);

  // useEffect(() => {
  //   const scrollTo = (offset: number) => {
  //     flashListRef.current?.scrollToOffset({
  //       animated: true,
  //       offset
  //     })
  //   }

  //   setScrollTo(scrollTo);
  // }, []);
  
  const contentStyle: ContentStyle = useMemo(() => ({
    paddingBottom: tabBarHeight,
    ...contentContainerStyle,
  }), [contentContainerStyle]);
 
  return (
    <View style={styles.container}>
      <AnimatedFlashList
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentStyle}
        horizontal={false}
        {...other}
      />
    </View>
  );
}));

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});