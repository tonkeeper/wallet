import { useRecoveryPhraseInputs } from '../../../hooks/useRecoveryPhraseInputs';
import { InputNumberPrefix } from '../../../components/InputNumberPrefix';
import { SearchIndexer } from '@tonkeeper/core/src/utils/SearchIndexer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { memo, useCallback, useEffect, useState } from 'react';
import { bip39 } from '@tonkeeper/core/src/bip39';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { Pressable } from 'react-native';
import {
  KeyboardAccessoryView,
  Screen,
  Button,
  Spacer,
  Steezy,
  Text,
  View,
  Input,
  useReanimatedKeyboardHeight,
} from '@tonkeeper/uikit';

const inputsCount = Array(24).fill(0);
const indexedWords = new SearchIndexer(bip39.list);

// const fullMatch = hints.some((item) => item === options.query);
interface SetupPhrasePageProps {
  onNext: (phrase: string, config?: string) => void;
  loading: boolean;
}

export const SetupRecoveryPhrasePage = memo<SetupPhrasePageProps>((props) => {
  const { onNext, loading } = props;
  const inputs = useRecoveryPhraseInputs();
  const safeArea = useSafeAreaInsets();

  const [isConfigInputShown, setConfigInputShown] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [isRestoring, setRestoring] = useState(false);
  const [config, setConfig] = useState('');

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

    if (hasFailed) {
      // Toast.fail(t('import_wallet_wrong_words_err'));
      setRestoring(false);
      return;
    }

    const phrase = Object.values(values).join(' ');

    onNext(phrase, config);
  }, [onNext, isRestoring, isConfigInputShown, config]);

  const handleInputSubmit = useCallback(
    (index: number) => () => {
      if (index < 23) {
        inputs.getRef(index + 1)?.focus();
      } else {
        handleContinue();
      }
    },
    [handleContinue],
  );

  const handleChangeText = useCallback(
    (inputIndex: number) => (text: string) => {
      inputs.onChangeText(inputIndex);

      const hints = indexedWords
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
        .slice(0, 3);

      setHints(hints);
    },
    [inputs.onChangeText],
  );

  const handleHintPress = useCallback(
    (hint: string) => () => {
      console.log(inputs.currentIndex);
      inputs.getRef(inputs.currentIndex.current)?.setValue(hint);
      inputs.getRef(inputs.currentIndex.current + 1)?.focus();
      setHints([]);
    },
    [],
  );

  const keyboard = useReanimatedKeyboardHeight();

  const keyboardSpacerStyle = useAnimatedStyle(
    () => ({
      height: keyboard.height.value - safeArea.bottom + 32 + (hints.length ? 52 : 0),
    }),
    [keyboard.height, hints.length],
  );

  return (
    <>
      <Screen.ScrollView ref={inputs.scrollViewRef} keyboardShouldPersistTaps="handled">
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
              onFocus={inputs.onFocus(index)}
              onBlur={inputs.onBlur(index)}
              ref={inputs.setRef(index)}
              disableAutoMarkValid
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
          <Button onPress={handleContinue} title="Continue" loading={loading} />
        </View>

        <Animated.View style={keyboardSpacerStyle} />
      </Screen.ScrollView>
      <KeyboardAccessoryView
        style={styles.hintsContainer}
        hidden={hints.length === 0}
        height={52}
      >
        {hints.length === 3 && (
          <>
            <Pressable onPress={handleHintPress(hints[2])}>
              <View style={styles.hint}>
                <Text type="label2" textAlign="center">
                  {hints[2]}
                </Text>
              </View>
            </Pressable>
            <View style={styles.hintSeparator} />
          </>
        )}
        <Pressable onPress={handleHintPress(hints[0])}>
          <View style={[styles.hint, styles.highlightedHint]}>
            <Text type="label2" textAlign="center">
              {hints[0]}
            </Text>
          </View>
        </Pressable>
        {hints.length === 3 && (
          <>
            <View style={styles.hintSeparator} />
            <Pressable onPress={handleHintPress(hints[1])}>
              <View style={styles.hint}>
                <Text type="label2" textAlign="center">
                  {hints[1]}
                </Text>
              </View>
            </Pressable>
          </>
        )}
      </KeyboardAccessoryView>
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
