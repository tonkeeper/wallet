import { 
  View as NativeView, 
  TouchableHighlight as NativeTouchableHighlight,
  TouchableOpacity as NativeTouchableOpacity
} from 'react-native';

import { Text } from './Text/Text';

import { Steezy } from '$styles';

export const SText = Steezy.withStyle(Text);
export const View = Steezy.withStyle(NativeView);
export const TouchableHighlight = Steezy.withStyle(NativeTouchableHighlight);
export const TouchableOpacity = Steezy.withStyle(NativeTouchableOpacity);
