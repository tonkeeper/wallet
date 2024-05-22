import { GenericTouchableProps } from 'react-native-gesture-handler/lib/typescript/components/touchables/GenericTouchable';
import { TouchableOpacity as GestureHandlerTouchableOpacity } from 'react-native-gesture-handler';
import {
  TouchableOpacity as NativeTouchableOpacity,
  TouchableOpacityProps as NativeTouchableOpacityProps,
} from 'react-native';
import { WithStyleProp } from '@bogoslavskiy/react-native-steezy';
import { Steezy } from '../styles';
import { memo } from 'react';

type TGenericTouchableProps = NativeTouchableOpacityProps & GenericTouchableProps;

interface TouchableOpacityProps extends WithStyleProp<TGenericTouchableProps> {
  gestureHandler?: boolean;
}

export const TouchableOpacity = memo<TouchableOpacityProps>((props) => {
  const { gestureHandler, activeOpacity = 0.6, ...other } = props;
  const style = Steezy.useStyle(props.style);

  const Component = gestureHandler
    ? GestureHandlerTouchableOpacity
    : NativeTouchableOpacity;

  return <Component {...other} style={style} activeOpacity={activeOpacity} />;
});
