import { 
  View as NativeView, 
  TouchableHighlight as NativeTouchableHighlight,
  TouchableOpacity as NativeTouchableOpacity,
  Image as NativeImage,
} from 'react-native';

import { Text } from './Text/Text';

import { Steezy } from '$styles';
import Animated from 'react-native-reanimated';

export const SText = Steezy.withStyle(Text);
export const View = Steezy.withStyle(NativeView);
export const AnimatedView = Steezy.withStyle(Animated.View);
export const TouchableHighlight = Steezy.withStyle(NativeTouchableHighlight);
export const TouchableOpacity = Steezy.withStyle(NativeTouchableOpacity);
export const Image = Steezy.withStyle(NativeImage);
