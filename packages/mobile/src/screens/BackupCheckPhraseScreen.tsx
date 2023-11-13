import { useRecoveryPhraseInputs } from '@tonkeeper/shared/hooks/useRecoveryPhraseInputs';
import { InputNumberPrefix } from '@tonkeeper/shared/components/InputNumberPrefix';
import { Screen, Steezy, View, Text, Input, Spacer } from '@tonkeeper/uikit';
import { useParams } from '@tonkeeper/router/src/imperative';
import { memo, useCallback, useEffect } from 'react';

export const BackupCheckPhraseScreen = memo(() => {
  const params = useParams<{ words: { index: number; word: string }[] }>();
  const inputs = useRecoveryPhraseInputs();

  const handleSubmit = useCallback((index: number) => () => {}, []);

  useEffect(() => {}, []);

  return (
    <Screen>
      <Screen.Header />
      <Screen.ScrollView
        style={styles.scrollViewContnet.static}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <Text type="h2" textAlign="center">
          Backup Check
        </Text>
        <Spacer y={4} />
        <Text type="body1" color="textSecondary" textAlign="center">
          Let's see if you've got everything right. Enter words 7, 14, and 21.
        </Text>
        <Spacer y={16} />
        <View style={styles.inputsContainer}>
          {params.words!.map(({ index, word }) => (
            <View key={`${word}-${index}`}>
              <Input
                key={`input-${index}`}
                renderToHardwareTextureAndroid
                leftContent={<InputNumberPrefix index={index} />}
                returnKeyType={index === 23 ? 'done' : 'next'}
                onSubmitEditing={handleSubmit(index)}
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
            </View>
          ))}
        </View>
      </Screen.ScrollView>
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
