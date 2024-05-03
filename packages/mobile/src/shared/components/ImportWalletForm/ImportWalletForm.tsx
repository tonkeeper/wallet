import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { TapGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

import { deviceHeight, isAndroid, ns, parseLockupConfig } from '$utils';
import { InputItem } from './InputItem';
import { Input, NavBarHelper, Text, Button } from '$uikit';
import * as S from './ImportWalletForm.style';
import { useReanimatedKeyboardHeight } from '$hooks/useKeyboardHeight';
import { ImportWalletFormProps } from './ImportWalletForm.interface';
import { useInputsRegistry } from './useInputRegistry';
import { WordHintsPopup, WordHintsPopupRef } from './WordHintsPopup';
import { Keyboard, KeyboardAvoidingView } from 'react-native';
import { wordlist } from '$libs/Ton/mnemonic/wordlist';
import { Toast } from '$store';
import { t } from '@tonkeeper/shared/i18n';
import { Steezy, Button as ButtonNew, View } from '@tonkeeper/uikit';
import Clipboard from '@react-native-community/clipboard';

export const ImportWalletForm: FC<ImportWalletFormProps> = (props) => {
  const { onWordsFilled } = props;

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
  const [hasTextInAnyOfInputs, setHasTextInAnyOfInputs] = useState(false);

  const deferredScrollToInput = useRef<((offset: number) => void) | null>(null);
  const { keyboardHeight } = useReanimatedKeyboardHeight({
    enableOnAndroid: true,
    animated: true,
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

  const handleMultipleWords = useCallback(
    (index: number, text: string) => {
      if (!hasTextInAnyOfInputs) {
        setHasTextInAnyOfInputs(true);
      }
      const words = text
        .replace(/\r\n|\r|\n/g, ' ')
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
    },
    [hasTextInAnyOfInputs, inputsRegistry],
  );

  const handlePasteButton = useCallback(async () => {
    if (!hasTextInAnyOfInputs) {
      setHasTextInAnyOfInputs(true);
    }
    const maybePhrase = await Clipboard.getString();
    if (maybePhrase.replace(/\r\n|\r|\n/g, ' ').split(' ').length === 24) {
      handleMultipleWords(0, maybePhrase);
    }
  }, [hasTextInAnyOfInputs, handleMultipleWords]);

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
      Toast.fail(t('import_wallet_wrong_words_err'));
      setRestoring(false);
      return;
    }

    Keyboard.dismiss();

    let configParsed: any = null;
    if (isConfigInputShown && config) {
      try {
        configParsed = parseLockupConfig(config);
      } catch (e) {
        Toast.fail(`Lockup: ${(e as Error).message}`);
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
      if (
        !text &&
        hasTextInAnyOfInputs &&
        Object.values(inputsRegistry.refs).filter((val) => val.getValue()).length === 1
      ) {
        setHasTextInAnyOfInputs(false);
      } else if (!hasTextInAnyOfInputs) {
        setHasTextInAnyOfInputs(true);
      }
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
    [hasTextInAnyOfInputs],
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
      <KeyboardAvoidingView>
        <View style={[styles.pasteButtonContainer, { bottom: bottomInset + 16 }]}>
          {!hasTextInAnyOfInputs && (
            <Animated.View entering={FadeIn.duration(200)}>
              <ButtonNew
                onPress={handlePasteButton}
                color="tertiary"
                size="medium"
                title={t('paste')}
              />
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = Steezy.create({
  pasteButtonContainer: {
    position: 'absolute',
    alignItems: 'center',
    left: 0,
    right: 0,
  },
});
