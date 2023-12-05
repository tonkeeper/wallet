import { ScrollViewProps, View, StyleSheet } from 'react-native';
import { ScreenBottomSeparator } from './ScreenBottomSeparator';
import { forwardRef, memo, useEffect, useMemo } from 'react';
import { useBottomTabBarHeight } from '@tonkeeper/router';
import { useScrollToTop } from '@react-navigation/native';
import { ns, useMergeRefs } from '../../utils';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useScreenScroll } from './hooks';

interface ScreenScrollView extends ScrollViewProps {
  hideBottomSeparator?: boolean;
  keyboardAware?: boolean;
  indent?: boolean;
}

export type ScreenScrollViewRef = Animated.ScrollView;

export const ScreenScrollView = memo(
  forwardRef<ScreenScrollViewRef, ScreenScrollView>((props, ref) => {
    const {
      indent,
      hideBottomSeparator,
      keyboardAware,
      contentContainerStyle,
      ...other
    } = props;
    const {
      detectContentSize,
      detectLayoutSize,
      scrollHandler,
      headerOffsetStyle,
      scrollRef,
      scrollY,
      headerEjectionPoint,
    } = useScreenScroll();
    const tabBarHeight = useBottomTabBarHeight();
    const setRef = useMergeRefs(scrollRef, ref);
    const keyboard = useAnimatedKeyboard();

    useScrollToTop(scrollRef as any);

    useEffect(() => {
      headerEjectionPoint.value = 0;
      return () => {
        scrollY.value = 0;
      };
    }, []);

    const contentStyle = useMemo(() => {
      return [
        { paddingBottom: tabBarHeight },
        indent && styles.indent,
        contentContainerStyle,
      ];
    }, [contentContainerStyle, tabBarHeight]);

    const keyboardOffsetStyle = useAnimatedStyle(() => ({
      height: keyboardAware ? keyboard.height.value : 0,
    }));

    return (
      <View style={styles.container}>
        <Animated.ScrollView
          onContentSizeChange={detectContentSize}
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
          onLayout={detectLayoutSize}
          scrollEventThrottle={16}
          onScroll={scrollHandler}
          ref={setRef}
          {...other}
        >
          <Animated.View style={headerOffsetStyle} />
          {props.children}
          <Animated.View style={keyboardOffsetStyle} />
        </Animated.ScrollView>
        {!hideBottomSeparator && <ScreenBottomSeparator />}
      </View>
    );
  }),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  indent: {
    paddingHorizontal: ns(16),
  },
});
