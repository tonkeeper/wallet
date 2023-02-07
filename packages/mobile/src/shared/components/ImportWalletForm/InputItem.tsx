import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { wordlist } from '$libs/Ton/mnemonic/wordlist';
import { TextInput } from 'react-native';
import { Input } from '$uikit';
import { css } from '$styled';
import { ns } from '$utils';
import { InputItemProps, InputItemRef } from './ImportWalletForm.interface';
import * as S from './ImportWalletForm.style';

export const InputItem = forwardRef<InputItemRef, InputItemProps>((props, ref) => {
  const { index, onSubmitEditing, onFocus, onBlur, onMultipleWords, onSpace, onLayout, onChangeText, onContentSizeChange } = props;

  const inputRef = useRef<TextInput>(null);
  const [value, setValue] = useState('');
  const [isFailed, setFailed] = useState(false);

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current?.focus();
    },
    markAsFailed() {
      if (!isFailed) {
        setFailed(true);
      }
    },
    setValue(newValue) {
      newValue = newValue.substr(0, 20);
      setValue(newValue);
      setFailed(newValue.length > 0 && !wordlist.enMap.has(newValue));
    },
    getValue() {
      return value;
    },
  }));

  const handleChangeText = useCallback(
    (text) => {
      let newText = text.trim();
      if (newText.split(' ').length > 1) {
        onMultipleWords(index, newText);
      } else if (text.slice(-1) === ' ') {
        onSpace(index);
      } else {
        newText = newText.substr(0, 20);
        setValue(newText);
        onChangeText && onChangeText(newText);

        if (isFailed) {
          const checked = newText.length === 0 || wordlist.enMap.has(newText);
          if (checked) {
            setFailed(false);
          }
        }
      }
    },
    [index, isFailed, onMultipleWords, onChangeText],
  );

  const handleBlur = useCallback(() => {
    setFailed(value.length > 0 && !wordlist.enMap.has(value));
    onBlur();
  }, [value]);

  return (
    <S.InputWrap onLayout={onLayout}>
      <S.InputNumber>{index + 1}:</S.InputNumber>
      <Input
        autoFocus={index === 0}
        autoCapitalize="none"
        autoCorrect={false}
        innerRef={inputRef}
        allowFontScaling={false}
        accessible={false}
        renderToHardwareTextureAndroid
        wrapperStyle={css`
          padding-left: ${ns(56)}px;
        `}
        style={{
          includeFontPadding: false,
        }}
        returnKeyType={index === 23 ? 'done' : 'next'}
        onSubmitEditing={onSubmitEditing}
        onChangeText={handleChangeText}
        onContentSizeChange={onContentSizeChange}
        value={value}
        isFailed={isFailed}
        onBlur={handleBlur}
        onFocus={onFocus}
        blurOnSubmit={false}
      />
    </S.InputWrap>
  );
});
