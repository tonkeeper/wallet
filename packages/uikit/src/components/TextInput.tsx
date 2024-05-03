import { TextInput as GestureTextInput } from 'react-native-gesture-handler';
import { Steezy, StyleProp, useTheme } from '../styles';
import { forwardRef } from 'react';
import {
  TextInputProps as NativeTextInputProps,
  TextInput as NativeTextInput,
  TextStyle,
} from 'react-native';

const { useStyle } = Steezy;

export type TextInputProps = Omit<NativeTextInputProps, 'style'> & {
  component?: React.ComponentType<NativeTextInputProps>;
  style?: StyleProp<TextStyle>;
  gesture?: boolean;
};

export type TextInputRef = NativeTextInput;

export const TextInput = forwardRef<TextInputRef, TextInputProps>((props, ref) => {
  const { gesture, component, style, ...rest } = props;
  const styles = useStyle(style);
  const theme = useTheme();

  const Component = gesture ? GestureTextInput : component ?? NativeTextInput;

  // @ts-ignore
  return (
    <Component
      ref={ref}
      style={styles}
      {...rest}
      keyboardAppearance={theme.isDark ? 'dark' : 'light'}
    />
  );
});
