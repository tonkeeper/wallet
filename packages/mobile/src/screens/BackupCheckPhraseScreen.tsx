import { useRecoveryPhraseInputs } from '@tonkeeper/shared/hooks/useRecoveryPhraseInputs';
import { Screen, Steezy, View, Text, Input, Spacer, Button } from '@tonkeeper/uikit';
import { InputNumberPrefix } from '@tonkeeper/shared/components/InputNumberPrefix';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from '@tonkeeper/router/src/imperative';
import { useNavigation } from '@tonkeeper/router';
import { tk } from '@tonkeeper/shared/tonkeeper';

export const BackupCheckPhraseScreen = memo(() => {
  const { words } = useParams<{ words: { index: number; word: string }[] }>();
  const [values, setValues] = useState<Record<string, string>>({});
  const inputs = useRecoveryPhraseInputs();
  const nav = useNavigation();

  const handleSubmit = useCallback(async () => {
    await tk.wallet.saveLastBackupTimestamp();
    nav.navigate('/backup');
  }, [nav]);

  useEffect(() => {
    inputs.getRef(0)?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = useCallback(
    (index: number) => (value: string) => {
      const input = inputs.getRef(index);
      if (input) {
        if (input.isInvalid()) {
          if (value.length === 0 || words[index].word === value) {
            input.markAsValid();
          }
        }
      }

      setValues((state) => ({ ...state, [`${index}`]: value }));
    },
    [inputs, words, setValues],
  );

  const onBlur = useCallback(
    (index: number) => () => {
      const input = inputs.getRef(index);
      const value = input?.getValue().trim();
      if (value && value.length > 0 && words[index].word !== value) {
        input.markAsInvalid();
      }
    },
    [inputs, words],
  );

  const isValid = useMemo(() => {
    const word1 = values['0'];
    const word2 = values['1'];
    const word3 = values['2'];

    return word1 === words[0].word && word2 === words[1].word && word3 === words[2].word;
  }, [values, words]);

  return (
    <Screen>
      <Screen.Header />
      <Screen.KeyboardAwareScrollView
        style={styles.scrollViewContnet.static}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <Text type="h2" textAlign="center">
          Backup Check
        </Text>
        <Spacer y={4} />
        <Text type="body1" color="textSecondary" textAlign="center">
          Let's see if you've got everything right. Enter words {words[0].index + 1},{' '}
          {words[1].index + 1}, and {words[2].index + 1}.
        </Text>
        <Spacer y={16} />
        <View style={styles.inputsContainer}>
          {words.map((item, index) => (
            <View key={`${item.word}-${index}`}>
              <Input
                key={`input-${index}`}
                renderToHardwareTextureAndroid
                leftContent={<InputNumberPrefix index={item.index} />}
                returnKeyType={index === 2 ? 'done' : 'next'}
                onChangeText={handleChange(index)}
                onLayout={inputs.setPosition(index)}
                onSubmitEditing={handleSubmit}
                onFocus={inputs.onFocus(index)}
                onBlur={onBlur(index)}
                ref={inputs.setRef(index)}
                disableAutoMarkValid
                style={styles.input}
                keyboardType="ascii-capable"
                textContentType="none"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                indentBottom
              />
            </View>
          ))}
        </View>
        <Button onPress={handleSubmit} title="Done" disabled={!isValid} />
      </Screen.KeyboardAwareScrollView>
    </Screen>
  );
});

const styles = Steezy.create({
  input: {
    paddingLeft: 50,
  },
  inputsContainer: {
    marginVertical: 16,
  },
  scrollViewContnet: {
    paddingHorizontal: 32,
  },
});
