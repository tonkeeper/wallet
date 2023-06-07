import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ScreenLargeHeaderHeight } from '../Screen/utils/constants';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { usePagerView } from './hooks/usePagerView';
import { useScreenScroll } from '../Screen/hooks';
import { PropsWithChildren, memo } from 'react';
import { isAndroid } from '../../utils';
import { useTheme } from '../../styles';

export const PagerViewInternalHeader = memo<PropsWithChildren>((props) => {
  const { measureHeader, scrollY } = usePagerView();
  const { isLargeHeader } = useScreenScroll();
  const dimensions = useWindowDimensions();
  const theme = useTheme();

  const largeHeaderHeight = useAnimatedStyle(() => ({
    width: dimensions.width,
    height: withTiming(isLargeHeader.value ? ScreenLargeHeaderHeight : 0),
  }), [isLargeHeader.value, dimensions.width]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollY.value }],
  }));

  return (
    <Animated.View
      pointerEvents="box-none"
      onLayout={measureHeader}
      style={[
        styles.container,
        containerAnimatedStyle,
        {
          width: dimensions.width,
          backgroundColor: theme.backgroundPage,
        },
      ]}
    >
      <Animated.View style={largeHeaderHeight} />
      {props.children}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    zIndex: isAndroid ? 1 : 4,
    position: 'absolute',
    top: 0,
  },
});
