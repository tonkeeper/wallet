import React from 'react';
import { TextInput } from 'react-native-gesture-handler';
import { TextInputProps } from 'react-native';
import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import { isAndroid, useMergeRefs } from '../../../utils';

export type SheetModalInputProps = TextInputProps;
export type SheetModalTextInputRef = TextInput;

const SheetTextInputComponent = React.forwardRef<
  SheetModalTextInputRef, 
  SheetModalInputProps
>(({ onFocus, onBlur, autoFocus, ...rest }, ref) => {
  const { shouldHandleKeyboardEvents } = useBottomSheetInternal();
  const inputRef = React.useRef<TextInput>(null);
  const setRef = useMergeRefs(ref, inputRef);

  // React.useEffect(() => {
  //   if (autoFocus) {
  //     setTimeout(() => {
  //       inputRef.current?.focus();
  //     }, 50);
  //   }
  // }, []);

  const handleOnFocus = React.useCallback(
    args => {
      shouldHandleKeyboardEvents.value = true;
      if (onFocus) {
        onFocus(args);
      }
    },
    [onFocus, shouldHandleKeyboardEvents]
  );

  const handleOnBlur = React.useCallback(
    args => {
      shouldHandleKeyboardEvents.value = false;
      if (onBlur) {
        onBlur(args);
      }
    },
    [onBlur, shouldHandleKeyboardEvents]
  );

  return (
    <TextInput
      ref={setRef}
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
      autoFocus={autoFocus}
      {...rest}
    />
  );
});

export const SheetModalInput = isAndroid ? TextInput : React.memo(SheetTextInputComponent);
SheetModalInput.displayName = 'SheetInput';