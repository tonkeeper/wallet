import React from 'react';
import { TextInputProps as NativeTextInputProps } from 'react-native';
import { TextInput as NativeTextInput } from 'react-native-gesture-handler';

export type TextInputProps = NativeTextInputProps & {
  component?: React.ComponentType<NativeTextInputProps>;
}

export type InputRef = NativeTextInput;

export const TextInput = React.forwardRef<InputRef, TextInputProps>(({ component, ...rest }, ref) => {
  const Component = component ? component : NativeTextInput

  return <Component ref={ref} {...rest} />
});