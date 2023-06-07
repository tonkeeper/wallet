import { FlashList, ContentStyle, FlashListProps } from '@shopify/flash-list';
import { Fragment, forwardRef, memo, useEffect, useMemo } from 'react';
import { ScreenBottomSeparator } from './ScreenBottomSeparator';
import { useBottomTabBarHeight } from '@tonkeeper/router';
import { useScrollToTop } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useMergeRefs } from '../../utils';
import { useScreenScroll } from './hooks';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);

export type ScreenScrollListProps = FlashListProps<any> & {
  hideBottomSeparator?: boolean;
};

export const ScreenScrollList = memo<ScreenScrollListProps>(forwardRef((props, ref) => {
  const { contentContainerStyle, hideBottomSeparator, ListHeaderComponent, ...other } = props;
  const { detectContentSize, detectLayoutSize, scrollHandler, headerOffsetStyle, scrollRef, headerEjectionPoint } = useScreenScroll();
  const tabBarHeight = useBottomTabBarHeight();
  const setRef = useMergeRefs(scrollRef, ref);

  useScrollToTop(scrollRef as any);

  useEffect(() => {
    headerEjectionPoint.value = 0;
  }, []);

  // useScrollHandler(undefined, true); // TODO: remove this, when old separator will be removed

  const contentStyle: ContentStyle = useMemo(() => ({
    paddingBottom: tabBarHeight,
    ...contentContainerStyle,
  }), [contentContainerStyle, tabBarHeight]);

  const HeaderComponent = (
    <Fragment>
      <Animated.View style={headerOffsetStyle} />
      {ListHeaderComponent as any}
    </Fragment>
  );

  return (
    <View style={styles.container}>
      <AnimatedFlashList
        onContentSizeChange={detectContentSize}
        ListHeaderComponent={HeaderComponent}
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
