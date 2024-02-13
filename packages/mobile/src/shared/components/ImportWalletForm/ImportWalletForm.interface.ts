import { InputContentSize } from '$uikit/Input/Input.interface';
import { LayoutChangeEvent } from 'react-native';

export interface ImportWalletFormProps {
  onWordsFilled: (mnemonic: string, config: any, onEnd: () => void) => void;
}

export interface InputItemRef {
  focus: () => void;
  markAsFailed: () => void;
  setValue: (value: string) => void;
  getValue: () => string;
}

export interface InputItemProps {
  index: number;
  onSubmitEditing: () => void;
  onFocus: () => void;
  onBlur: () => void;
  onMultipleWords: (start: number, text: string) => void;
  onSpace: (index: number) => void;
  onLayout?: (ev: LayoutChangeEvent) => void;
  onChangeText?: (text: string) => void;
  onContentSizeChange?: (contentSize: InputContentSize) => void;
}
