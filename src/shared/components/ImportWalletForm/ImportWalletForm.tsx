import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

import { deviceHeight, isAndroid, ns, parseLockupConfig } from '$utils';
import { InputItem } from './InputItem';
import { Button, Input, NavBarHelper, Text } from '$uikit';
import * as S from './ImportWalletForm.style';
import { useReanimatedKeyboardHeight, useTranslator } from '$hooks';
import { toastActions } from '$store/toast';
import { ImportWalletFormProps } from './ImportWalletForm.interface';
import { useInputsRegistry } from './useInputRegistry';
import { WordHintsPopup, WordHintsPopupRef } from './WordHintsPopup';
import { Keyboard } from 'react-native';
import { wordlist } from '$libs/Ton/mnemonic/wordlist';

export const ImportWalletForm: FC<ImportWalletFormProps> = (props) => {
  const { onWordsFilled } = props;

  const t = useTranslator();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const dispatch = useDispatch();
  const inputsRegistry = useInputsRegistry();
  const inputs = useMemo(() => Array(24).fill(0), []);

  const scrollRef = useRef<Animated.ScrollView>(null);
  const wordHintsRef = useRef<WordHintsPopupRef>(null);
  const scrollY = useSharedValue(0);

  const [isConfigInputShown, setConfigInputShown] = useState(false);
  const [config, setConfig] = useState('');
  const [isRestoring, setRestoring] = useState(false);

  const deferredScrollToInput = useRef<((offset: number) => void) | null>(null);
  const { keyboardHeight } = useReanimatedKeyboardHeight({
    enableOnAndroid: true,
    onWillShow: ({ height }) => {
      if (deferredScrollToInput.current) {
        deferredScrollToInput.current(height);
        deferredScrollToInput.current = null;
      }
    },
  });

  const handleShowConfigInput = useCallback(() => {
    setConfigInputShown(true);
  }, []);

  const handleConfigChange = useCallback((text) => {
    setConfig(text);
  }, []);

  const handleMultipleWords = useCallback((index: number, text: string) => {
    const words = text
      .split(' ')
      .map((word) => word.trim())
      .filter((word) => word.length > 0);

    let cursor = index;
    for (const word of words) {
      inputsRegistry.getRef(cursor)?.setValue(word);
      cursor += 1;
      if (cursor === 24) {
        break;
      }
    }

    if (cursor > 0) {
      inputsRegistry.getRef(cursor - 1)?.focus();
    }
  }, []);

  const handleSpace = useCallback((index: number) => {
    if (index === 24) {
      return;
    }
    inputsRegistry.getRef(index + 1)?.focus();
  }, []);

  const handleSend = useCallback(() => {
    if (isRestoring) {
      return;
    }

    setRestoring(true);

    const values: string[] = [];
    for (let key in inputsRegistry.refs) {
      values.push(inputsRegistry.refs[key]?.getValue() ?? '');
    }

    let hasFailed = false;
    for (let i = 0; i < inputs.length; i++) {
      const isFailed = !values[i].length || !wordlist.enMap.has(values[i]);
      if (isFailed) {
        hasFailed = true;
        const ref = inputsRegistry.getRef(i);
        ref?.markAsFailed();
        ref?.focus();
        break;
      }
    }

    if (hasFailed) {
      dispatch(toastActions.fail(t('import_wallet_wrong_words_err')));
      setRestoring(false);
      return;
    }

    Keyboard.dismiss();

    let configParsed: any = null;
    if (isConfigInputShown && config) {
      try {
        configParsed = parseLockupConfig(config);
      } catch (e) {
        dispatch(toastActions.fail(`Lockup: ${(e as Error).message}`));
        setRestoring(false);
        return;
      }
    }

    onWordsFilled(Object.values(values).join(' '), configParsed, () =>
      setRestoring(false),
    );
  }, [isRestoring, isConfigInputShown, config, onWordsFilled, dispatch, t]);

  const handleInputSubmit = useCallback(
    (index: number) => () => {
      const suggests = wordHintsRef.current?.getCurrentSuggests();
      if (suggests?.length === 1) {
        inputsRegistry.getRef(index)?.setValue(suggests[0]);
      }
      if (index < 23) {
        inputsRegistry.getRef(index + 1)?.focus();
      } else {
        handleSend();
      }
    },
    [handleSend],
  );

  const scrollToInput = useCallback((index: number, offsetBottom: number = 0) => {
    const inputPos = inputsRegistry.getPosition(index);
    if (inputPos !== undefined) {
      scrollRef.current?.scrollTo({
        y: inputPos - (deviceHeight - offsetBottom) / 2 + ns(16),
        animated: true,
      });
    }
  }, []);

  const handleFocus = useCallback(
    (index: number) => () => {
      if (keyboardHeight.value < 1) {
        deferredScrollToInput.current = (offsetBottom: number) => {
          scrollToInput(index, offsetBottom);
        };
      } else {
        scrollToInput(index, keyboardHeight.value);
      }
    },
    [scrollToInput],
  );

  const handleBlur = useCallback(() => {
    wordHintsRef.current?.clear();
  }, []);

  const inputIndentLeft = ns(56);
  const setContentWidthInput = React.useCallback((index: number) => {
    return inputsRegistry.setContentWidth(index, (width) => {
      if (!isAndroid) {
        wordHintsRef.current?.setOffsetLeft(index, inputIndentLeft + width);
      }
    });
  }, []);

  const handleChangeText = useCallback(
    (index: number) => (text: string) => {
      const overlap = 10;
      const offsetTop = inputsRegistry.getPosition(index) + S.INPUT_HEIGHT - overlap;
      const contentWidth = isAndroid ? 0 : inputsRegistry.getContentWidth(index);
      const offsetLeft = inputIndentLeft + contentWidth;

      wordHintsRef.current?.search({
        input: index,
        query: text,
        offsetTop,
        offsetLeft,
        onItemPress: (value) => {
          inputsRegistry.getRef(index)?.setValue(value);
          inputsRegistry.getRef(index + 1)?.focus();
        },
      });
    },
    [],
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (ev) => {
      scrollY.value = ev.contentOffset.y;
    },
  });

  return (
    <>
      <WordHintsPopup
        scrollY={scrollY}
        indexedWords={wordlist.enIndexed}
        ref={wordHintsRef}
      />
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={false}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: ns(32),
          paddingBottom: ns(32) + bottomInset,
        }}
      >
        <NavBarHelper />
        <S.Header>
          <TapGestureHandler numberOfTaps={5} onActivated={handleShowConfigInput}>
            <S.HeaderTitle>{t('import_wallet_title')}</S.HeaderTitle>
          </TapGestureHandler>
          <S.HeaderCaptionWrapper>
            <Text color="foregroundSecondary" variant="body1" textAlign="center">
              {t('import_wallet_caption')}
            </Text>
          </S.HeaderCaptionWrapper>
        </S.Header>
        {isConfigInputShown && (
          <Input
            placeholder="Put config here"
            multiline
            value={config}
            onChangeText={handleConfigChange}
          />
        )}
        {inputs.map((_, index) => (
          <InputItem
            key={`input-${index}`}
            index={index}
            onSubmitEditing={handleInputSubmit(index)}
            onFocus={handleFocus(index)}
            onBlur={handleBlur}
            ref={inputsRegistry.setRef(index)}
            onContentSizeChange={setContentWidthInput(index)}
            onLayout={inputsRegistry.setPosition(index)}
            onChangeText={handleChangeText(index)}
            onMultipleWords={handleMultipleWords}
            onSpace={handleSpace}
          />
        ))}
        <S.ButtonWrap>
          <Button onPress={handleSend} isLoading={isRestoring}>
            {t('continue')}
          </Button>
        </S.ButtonWrap>
      </Animated.ScrollView>
    </>
  );
};
