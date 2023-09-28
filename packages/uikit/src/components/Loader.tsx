import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { View, StyleSheet, Image, ImageRequireSource } from 'react-native';
import { ThemeKeys } from '../styles/themes/theme.type';
import { memo, useEffect } from 'react';
import { useTheme } from '../styles';
import { ns } from '../utils';

export type LoaderSizes = 'medium' | 'large' | 'xlarge' | 'small' | 'xsmall';

const loaderSize: { [key in LoaderSizes]: number } = {
  xlarge: ns(64),
  large: ns(32),
  medium: ns(24),
  small: ns(16),
  xsmall: ns(12),
};

const loaderIcon: { [key in LoaderSizes]: ImageRequireSource } = {
  xsmall: require('../../assets/icons/png/ic-loader-xsmall-12.png'),
  small: require('../../assets/icons/png/ic-loader-small-16.png'),
  medium: require('../../assets/icons/png/ic-loader-medium-24.png'),
  large: require('../../assets/icons/png/ic-loader-large-32.png'),
  xlarge: require('../../assets/icons/png/ic-loader-xlarge-64.png'),
};

interface LoaderProps {
  size: LoaderSizes;
  color?: ThemeKeys;
}

export const Loader = memo<LoaderProps>((props) => {
  const { size = 'medium', color = 'iconSecondary' } = props;
  const rotate = useSharedValue(0);
  const theme = useTheme();
  
  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.linear,
      }),
      Infinity,
    );

    return () => cancelAnimation(rotate);
  }, [rotate]);

  const style = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: interpolate(rotate.value, [0, 1], [0, 360]) + 'deg',
      },
    ],
  }));

  const icon = loaderIcon[size];
  const sizePx = loaderSize[size];
  const sizeStyle = { width: sizePx, height: sizePx };
  const imageStyle = {
    tintColor: theme[color],
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[sizeStyle, style]}>
        <Image style={[sizeStyle, imageStyle]} source={icon} />
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
