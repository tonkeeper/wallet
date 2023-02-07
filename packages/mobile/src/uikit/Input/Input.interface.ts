import { ReactElement, Ref } from 'react';
import { TextInputProps } from './TextInput';

import { css } from '$styled';

export interface InputContentSize {
  width: number;
  height: number;
}

export interface InputProps
  extends Omit<TextInputProps, 'onContentSizeChange' | 'value'> {
  innerRef?: Ref<any>;
  inputStyle?: ReturnType<typeof css>;
  wrapperStyle?: ReturnType<typeof css>;
  isFailed?: boolean;
  value?: string | ReactElement;
  onContentSizeChange?: (contentSize: InputContentSize) => void;
}
