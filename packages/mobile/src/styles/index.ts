import { StyleProp as SteezyStyleProp } from '@bogoslavskiy/react-native-steezy';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

export type StaticStyles = ViewStyle | TextStyle | ImageStyle;
export type StyleProp<T = StaticStyles> = SteezyStyleProp<T>;

export { Steezy } from './Steezy';
