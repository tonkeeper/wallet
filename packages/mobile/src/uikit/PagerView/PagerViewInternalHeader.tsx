import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { usePagerView } from './hooks/usePagerView';
import { PropsWithChildren, memo } from 'react';
import { isAndroid } from '$utils';
import { useTheme } from '$hooks';

export const PagerViewInternalHeader = memo<PropsWithChildren>((props) => {
  const { measureHeader, scrollY } = usePagerView();
  const dimensions = useWindowDimensions();
  const theme = useTheme();

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
          backgroundColor: theme.colors.backgroundPrimary,
        },
      ]}
    >
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
