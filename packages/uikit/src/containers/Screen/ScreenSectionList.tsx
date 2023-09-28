import { Fragment, forwardRef, memo, useEffect, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenBottomSeparator } from './ScreenBottomSeparator';
import { useBottomTabBarHeight } from '@tonkeeper/router';
import { useScrollToTop } from '@react-navigation/native';
import { StyleSheet, View, SectionList, SectionListProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { useMergeRefs } from '../../utils';
import { useScreenScroll } from './hooks';

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList);

export type ScreenSectionListProps = SectionListProps<any> & {
  hideBottomSeparator?: boolean;
  safeArea?: boolean;
};

export const ScreenSectionList = memo<ScreenSectionListProps>(
  forwardRef((props, ref) => {
    const { contentContainerStyle, hideBottomSeparator, ListHeaderComponent, ...other } =
      props;
    const {
      detectContentSize,
      detectLayoutSize,
      scrollHandler,
      headerOffsetStyle,
      scrollRef,
      headerEjectionPoint,
    } = useScreenScroll();
    const tabBarHeight = useBottomTabBarHeight();
    const safeAreaInsets = useSafeAreaInsets();
    const setRef = useMergeRefs(scrollRef, ref);

    useScrollToTop(scrollRef as any);

    useEffect(() => {
      headerEjectionPoint.value = 0;
    }, []);

    const contentStyle = useMemo(
      () => ({
        paddingBottom: tabBarHeight === 0 ? safeAreaInsets.bottom : tabBarHeight,
        ...contentContainerStyle,
      }),
      [contentContainerStyle, tabBarHeight, safeAreaInsets.bottom],
    );

    const HeaderComponent = (
      <Fragment>
        <Animated.View style={headerOffsetStyle} />
        {typeof ListHeaderComponent === 'function'
          ? ListHeaderComponent()
          : (ListHeaderComponent as any)}
      </Fragment>
    );

    return (
      <View style={styles.container}>
        <AnimatedSectionList
          showsVerticalScrollIndicator={false}
          onContentSizeChange={detectContentSize}
          ListHeaderComponent={HeaderComponent}
          contentContainerStyle={contentStyle}
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
