import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutChangeEvent } from 'react-native';
import { useCallback, useRef } from 'react';
import {
  useReanimatedKeyboardHeight,
  ScreenScrollViewRef,
  InputRef,
} from '@tonkeeper/uikit';
import { bip39 } from '@tonkeeper/core/src/utils/mnemonic/bip39';

export function useRecoveryPhraseInputs(shiftScroll?: number) {
  const positions = useRef<{ [key in string]: number }>({});
  const refs = useRef<{ [key in string]: InputRef }>({});
  const scrollViewRef = useRef<ScreenScrollViewRef>(null);
  const safeArea = useSafeAreaInsets();
  const focusedIndex = useRef<number>(-1);

  const deferredScrollToInput = useRef<(() => void) | null>(null);
  const keyboard = useReanimatedKeyboardHeight({
    enableOnAndroid: true,
    onWillShow: ({ duration }) => {
      setTimeout(() => {
        if (deferredScrollToInput.current) {
          deferredScrollToInput.current();
          deferredScrollToInput.current = null;
        }
      }, duration + 30);
    },
  });

  const setRef = useCallback(
    (index: number) => (el: InputRef) => {
      refs.current[`input-${index}`] = el;
    },
    [],
  );

  const getRef = useCallback((index: number) => {
    return refs.current[`input-${index}`];
  }, []);

  const setPosition = useCallback(
    (index: number) => (ev: LayoutChangeEvent) => {
      positions.current[`input-${index}`] = ev.nativeEvent.layout.y;
    },
    [],
  );

  const getPosition = useCallback((index: number) => {
    return positions.current[`input-${index}`] ?? 0;
  }, []);

  const pasteMultipleWords = useCallback((index: number, text: string) => {
    const words = text
      .split(' ')
      .map((word) => word.trim())
      .filter((word) => word.length > 0);

    let cursor = index;
    for (const word of words) {
      getRef(cursor)?.setValue(word);
      cursor += 1;
      if (cursor === 24) {
        break;
      }
    }

    if (cursor > 0) {
      getRef(cursor - 1)?.focus();
    }
  }, []);

  const scrollToInput = useCallback(
    (index: number) => {
      if (index === 0) {
        return;
      }
      const inputPos = getPosition(index);
      if (inputPos !== undefined) {
        scrollViewRef.current?.scrollTo({
          y: inputPos + (shiftScroll ?? 24),
          animated: true,
        });
      }
    },
    [shiftScroll],
  );

  const onFocus = useCallback(
    (index: number) => () => {
      if (keyboard.height.value < 1) {
        deferredScrollToInput.current = () => {
          scrollToInput(index);
        };
      } else {
        scrollToInput(index);
      }

      focusedIndex.current = index;
    },
    [scrollToInput],
  );

  const onBlur = useCallback(
    (index: number) => () => {
      const input = getRef(index);
      const value = input?.getValue();
      if (value && value.length > 0 && !bip39.map[value]) {
        input.markAsInvalid();
      }

      focusedIndex.current = -1;
    },
    [],
  );

  const onChangeText = useCallback(
    (index: number) => (text: string) => {
      let newText = text.trim();
      if (newText.split(' ').length > 1) {
        pasteMultipleWords(index, newText);
      } else if (text.slice(-1) === ' ') {
        if (index !== 24) {
          getRef(index + 1)?.focus();
        }
      } else {
        const input = getRef(index);
        if (input) {
          // newText = newText.substr(0, 20);
          // input?.setValue(newText);
          if (input.isInvalid()) {
            if (newText.length === 0 || bip39.map[newText]) {
              // input.markAsValid();
            }
          }
        }
      }
    },
    [],
  );

  return {
    currentIndex: focusedIndex,
    refs: refs.current,
    scrollViewRef,
    setRef,
    getRef,
    setPosition,
    getPosition,
    onChangeText,
    onFocus,
    onBlur,
  };
}
