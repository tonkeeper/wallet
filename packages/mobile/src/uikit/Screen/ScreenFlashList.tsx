import { FlashList, ContentStyle, FlashListProps } from '@shopify/flash-list';
import { useScrollHandler } from '$uikit/ScrollHandler/useScrollHandler';
import { useBottomTabBarHeight } from '$hooks/useBottomTabBarHeight';
import { ScreenBottomSeparator } from './ScreenBottomSeparator';
import { forwardRef, memo, useEffect, useMemo } from 'react';
import { useScrollToTop } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useScreenScroll } from './hooks';
import { useMergeRefs } from '$utils';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export type ScreenScrollListProps = FlashListProps<any> & {
  hideBottomSeparator?: boolean;
};

export const ScreenScrollList = memo<ScreenScrollListProps>(forwardRef((props, ref) => {
  const { contentContainerStyle, hideBottomSeparator, ...other } = props;
  const { detectContentSize, detectLayoutSize, scrollHandler, scrollRef, headerEjectionPoint } = useScreenScroll();
  const tabBarHeight = useBottomTabBarHeight();
  const setRef = useMergeRefs(scrollRef, ref);

  useScrollToTop(scrollRef);

  useEffect(() => {
    headerEjectionPoint.value = 0;
  }, []);

  useScrollHandler(undefined, true); // TODO: remove this, when old separator will be removed

  const contentStyle: ContentStyle = useMemo(() => ({
    paddingBottom: tabBarHeight,
    ...contentContainerStyle,
  }), [contentContainerStyle]);

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
      {!hideBottomSeparator && (
        <ScreenBottomSeparator />
      )}
    </View>
  );
}));

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
