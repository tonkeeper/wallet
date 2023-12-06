import { useRecoveryPhraseInputs } from '../../../hooks/useRecoveryPhraseInputs';
import { InputNumberPrefix } from '../../../components/InputNumberPrefix';
import { SearchIndexer } from '@tonkeeper/core/src/utils/SearchIndexer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bip39 } from '@tonkeeper/core/src/bip39';
import { Pressable } from 'react-native';
import {
  KeyboardAccessoryViewRef,
  KeyboardAccessoryView,
  Screen,
  Button,
  Spacer,
  Steezy,
  Text,
  View,
  Input,
} from '@tonkeeper/uikit';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

const inputsCount = Array(24).fill(0);

interface SetupPhrasePageProps {
  onNext: (phrase: string, config?: string) => void;
}

export const SetupRecoveryPhrasePage = memo<SetupPhrasePageProps>((props) => {
  const { onNext } = props;
  const [isConfigInputShown, setConfigInputShown] = useState(false);
  const [isRestoring, setRestoring] = useState(false);
  const hintsRef = useRef<KeyboardHintsRef>(null);
  const [config, setConfig] = useState('');
  const inputs = useRecoveryPhraseInputs();
  const safeArea = useSafeAreaInsets();

  useEffect(() => {
    const lastField = inputs.getRef(23);
    if (!!lastField?.getValue()) {
      inputs.getRef(23)?.focus();
    } else {
      inputs.getRef(0)?.focus();
    }
  }, []);

  const handleShowConfigInput = useCallback(() => {
    setConfigInputShown(true);
  }, []);

  const handleConfigChange = useCallback((text: string) => {
    setConfig(text);
  }, []);

  const handleContinue = useCallback(() => {
    if (isRestoring) {
      return;
    }

    setRestoring(true);

    const values: string[] = [];
    for (let key in inputs.refs) {
      values.push(inputs.refs[key]?.getValue() ?? '');
    }

    let hasFailed = false;
    for (let i = 0; i < inputsCount.length; i++) {
      const isFailed = !values[i].length || !bip39.map[values[i]];
      if (isFailed) {
        hasFailed = true;
        const input = inputs.getRef(i);
        input?.markAsInvalid();
        input?.focus();
        break;
      }
    }

    // if (hasFailed) {
    //   // Toast.fail(t('import_wallet_wrong_words_err'));
    //   setRestoring(false);
    //   return;
    // }

    const phrase = Object.values(values).join(' ');
    setRestoring(false);
    onNext(phrase, config);
  }, [onNext, isRestoring, isConfigInputShown, config]);

  const handleInputSubmit = useCallback(
    (index: number) => () => {
      if (index < 23) {
        const hint = hintsRef.current?.getRelevantWord();
        if (hint) {
          inputs.getRef(index)?.setValue(hint);
        }
        inputs.getRef(index + 1)?.focus();
      } else {
        handleContinue();
      }
    },
    [handleContinue],
  );

  const handleChangeText = useCallback(
    (inputIndex: number) => (text: string) => {
      inputs.onChangeText(inputIndex)(text);
      hintsRef.current?.search(text);
      // const hints = searchWords(text);
      // setHints(hints);
      // if (hints.length > 0) {
      //   accessoryViewRef.current?.show();
      // } else {
      //   accessoryViewRef.current?.hide();
      // }
    },
    [inputs.onChangeText],
  );

  const handleInputFocus = useCallback(
    (inputIndex: number) => () => {
      inputs.onFocus(inputIndex)();
      const value = inputs.getRef(inputIndex).getValue();
      hintsRef.current?.search(value);
    },
    [inputs.onFocus],
  );

  const handleHintPress = useCallback((hint: string) => {
    if (hint) {
      inputs.getRef(inputs.currentIndex.current)?.setValue(hint);
      inputs.getRef(inputs.currentIndex.current + 1)?.focus();
    }
  }, []);

  // const keyboardSpacerStyle = useAnimatedStyle(
  //   () => ({
  //     height: keyboard.height.value - safeArea.bottom + 32 + (hints.length ? 52 : 0),
  //   }),
  //   [keyboard.height, hints.length],
  // );

  return (
    <>
      <Screen.ScrollView
        ref={inputs.scrollViewRef}
        keyboardShouldPersistTaps="handled"
        keyboardAware
      >
        <View style={styles.info}>
          {/* <TapGestureHandler numberOfTaps={5} onActivated={handleShowConfigInput}> */}
          <Pressable onPress={handleShowConfigInput}>
            <Text type="h2" textAlign="center">
              Enter recovery phrase
            </Text>
          </Pressable>
          {/* </TapGestureHandler> */}
          <Spacer y={4} />
          <Text type="body1" textAlign="center" color="textSecondary">
            When you created this wallet, you got a 24-word recovery phrase. Enter it to
            restore access to your wallet.
          </Text>
        </View>
        <View style={styles.content}>
          {isConfigInputShown && (
            <Input
              onChangeText={handleConfigChange}
              placeholder="Put config here"
              value={config}
              indentBottom
              multiline
            />
          )}
          {inputsCount.map((_, index) => (
            <Input
              key={`input-${index}`}
              renderToHardwareTextureAndroid
              leftContent={<InputNumberPrefix index={index} />}
              returnKeyType={index === 23 ? 'done' : 'next'}
              onSubmitEditing={handleInputSubmit(index)}
              onChangeText={handleChangeText(index)}
              onLayout={inputs.setPosition(index)}
              onFocus={handleInputFocus(index)}
              onBlur={inputs.onBlur(index)}
              ref={inputs.setRef(index)}
              disableAutoMarkValid
              blurOnSubmit={false}
              style={styles.input}
              indentBottom
              keyboardType="ascii-capable"
              textContentType="none"
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect={false}
            />
          ))}
        </View>
        <View style={[styles.footer, { paddingBottom: safeArea.bottom }]}>
          <Button onPress={handleContinue} title="Continue" />
        </View>
      </Screen.ScrollView>
      <KeyboardHints ref={hintsRef} onHintPress={handleHintPress} />
    </>
  );
});

const styles = Steezy.create(({ colors }) => ({
  info: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 16,
  },
  footer: {
    paddingTop: 16,
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  input: {
    paddingLeft: 50,
  },
  hintsContainer: {
    backgroundColor: colors.backgroundContentTint,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  hint: {
    padding: 8,
    width: 113.33,
    borderRadius: 18,
  },
  highlightedHint: {
    backgroundColor: colors.backgroundContentAttention,
  },
  hintSeparator: {
    width: 1,
    borderRadius: 1,
    height: 20,
    backgroundColor: colors.iconTertiary,
    marginHorizontal: 8,
  },
}));

const indexedWords = new SearchIndexer(bip39.list);

function searchWords(text: string) {
  return indexedWords
    .search(text, 6)
    .sort((a, b) => {
      const preparedQuery = text.toLowerCase().replace(/\s/g, '');
      const aMatch = a.toLowerCase().replace(/\s/g, '').includes(preparedQuery);
      const bMatch = b.toLowerCase().replace(/\s/g, '').includes(preparedQuery);
      if (aMatch && !bMatch) {
        return -1;
      }
      if (bMatch && !aMatch) {
        return 1;
      }

      return 0;
    })
    .slice(0, 4);
}

interface KeyboardHintsProps {
  onHintPress: (word: string) => void;
}

type KeyboardHintsRef = {
  search: (text: string) => void;
  getRelevantWord: () => string | null;
};

const KeyboardHints = forwardRef<KeyboardHintsRef, KeyboardHintsProps>((props, ref) => {
  const { onHintPress } = props;
  const accessoryViewRef = useRef<KeyboardAccessoryViewRef>(null);
  const [words, setWords] = useState<string[]>([]);

  const handleHintPress = useCallback(
    (word?: string) => () => {
      if (word) {
        onHintPress(word);
      }
    },
    [onHintPress],
  );

  useImperativeHandle(
    ref,
    () => ({
      search(text: string) {
        const words = searchWords(text);

        if (text !== words[0] && words.length > 0) {
          setWords(words);
          accessoryViewRef.current?.show();
        } else {
          setWords([]);
          accessoryViewRef.current?.hide();
        }
      },
      getRelevantWord() {
        return words[0] ?? null;
      },
    }),
    [words],
  );

  return (
    <KeyboardAccessoryView
      style={styles.hintsContainer}
      ref={accessoryViewRef}
      visibleWithKeyboard
    >
      <Pressable onPress={handleHintPress(words[1])}>
        <View style={styles.hint}>
          {!!words[1] && (
            <Text type="label2" textAlign="center">
              {words[1]}
            </Text>
          )}
        </View>
      </Pressable>
      {words.length > 1 && <View style={styles.hintSeparator} />}
      <Pressable onPress={handleHintPress(words[0])}>
        <View style={[styles.hint, styles.highlightedHint]}>
          <Text type="label2" textAlign="center">
            {words[0]}
          </Text>
        </View>
      </Pressable>
      {words.length > 1 && <View style={styles.hintSeparator} />}
      <Pressable onPress={handleHintPress(words[2])}>
        <View style={styles.hint}>
          {!!words[2] && (
            <Text type="label2" textAlign="center">
              {words[2]}
            </Text>
          )}
        </View>
      </Pressable>
    </KeyboardAccessoryView>
  );
});
