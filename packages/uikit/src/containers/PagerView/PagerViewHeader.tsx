import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { ScreenLargeHeaderHeight } from '../Screen/utils/constants';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { usePagerView } from './hooks/usePagerView';
import { useScreenScroll } from '../Screen/hooks';
import { PropsWithChildren, memo, useEffect } from 'react';
import { isAndroid } from '../../utils';
import { useTheme } from '../../styles';

export const PagerViewHeader = memo<PropsWithChildren>((props) => {
  const { measureHeader, scrollY } = usePagerView();
  const { headerType } = useScreenScroll();
  const dimensions = useWindowDimensions();
  const theme = useTheme();

  const largeHeaderHeight = useAnimatedStyle(() => ({
    width: dimensions.width,
    height: headerType === 'large' ? ScreenLargeHeaderHeight : 0,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -scrollY.value }],
  }));

  const width = dimensions.width;
  const backgroundPageColor = theme.backgroundPage;

  return (
    <Animated.View
      pointerEvents="box-none"
      onLayout={measureHeader}
      style={[
        styles.container,
        containerAnimatedStyle,
        {
          width,
          backgroundColor: backgroundPageColor,
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
