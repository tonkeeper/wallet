import { Screen, Button, Spacer, Steezy, Text, View, Input } from '@tonkeeper/uikit';
import { useRecoveryPhraseInputs } from '../../../hooks/useRecoveryPhraseInputs';
import { InputNumberPrefix } from '../../../components/InputNumberPrefix';
import { memo, useCallback, useEffect, useState } from 'react';

import { bip39 } from '@tonkeeper/core/src/bip39';
import Animated from 'react-native-reanimated';
import { Pressable } from 'react-native';

const inputsCount = Array(24).fill(0);

interface SetupPhrasePageProps {
  onNext: (phrase: string, config?: string) => void;
  loading: boolean;
}

export const SetupRecoveryPhrasePage = memo<SetupPhrasePageProps>((props) => {
  const { onNext, loading } = props;
  const inputs = useRecoveryPhraseInputs();

  const [isConfigInputShown, setConfigInputShown] = useState(false);
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

  return (
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
            onChangeText={inputs.onChangeText(index)}
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
      <View style={styles.footer}>
        <Button onPress={handleContinue} title="Continue" loading={loading} />
      </View>
      <Animated.View style={inputs.keyboardSpacerStyle} />
    </Screen.ScrollView>
  );
});

const styles = Steezy.create({
  info: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  content: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  footer: {
    paddingTop: 16,
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  input: {
    paddingLeft: 50,
  },
});
