import React, { forwardRef, memo, useMemo } from 'react';
import { FlashList, ContentStyle, FlashListProps } from '@shopify/flash-list';
import { useScrollHandler } from '$uikit/ScrollHandler/useScrollHandler';
import { useBottomTabBarHeight } from '$hooks/useBottomTabBarHeight';
import { useScreenScroll } from './context/ScreenScrollContext';
import { ScreenBottomSeparator } from './ScreenBottomSeparator';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useMergeRefs } from '$utils';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

type ScreenScrollListProps = FlashListProps<any> & {
  hideBottomSeparator?: boolean;
};

export const ScreenScrollList = memo<ScreenScrollListProps>(
  forwardRef((props, ref) => {
    const { contentContainerStyle, hideBottomSeparator, ...other } = props;
    const { detectContentSize, detectLayoutSize, scrollHandler, scrollRef } =
      useScreenScroll();
    const tabBarHeight = useBottomTabBarHeight();
    const setRef = useMergeRefs(ref, scrollRef);

    useScrollHandler(undefined, true); // TODO: remove this, when old separator will be removed

    const contentStyle: ContentStyle = useMemo(
      () => ({
        paddingBottom: tabBarHeight,
        ...contentContainerStyle,
      }),
      [contentContainerStyle],
    );

    return (
      <View style={styles.container}>
        <AnimatedFlashList
          onContentSizeChange={detectContentSize}
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
          onLayout={detectLayoutSize}
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          horizontal={false}
          ref={setRef}
          {...other}
        />
        {!hideBottomSeparator && <ScreenBottomSeparator />}
      </View>
    );
  }),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
