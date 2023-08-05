import { ReactElement, ReactNode, RefObject } from 'react';
import { TextInputProps } from './TextInput';

import { css } from '$styled';
import { TextInput } from 'react-native-gesture-handler';

export interface InputContentSize {
  width: number;
  height: number;
}

export interface InputProps
  extends Omit<TextInputProps, 'onContentSizeChange' | 'value'> {
  innerRef?: RefObject<TextInput>;
  inputStyle?: ReturnType<typeof css>;
  wrapperStyle?: ReturnType<typeof css>;
  isFailed?: boolean;
  isSuccessful?: boolean;
  value?: string | ReactElement;
  onContentSizeChange?: (contentSize: InputContentSize) => void;
  label?: string;
  rightContent?: ReactNode;
  withPasteButton?: boolean;
  withClearButton?: boolean;
}
