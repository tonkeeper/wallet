import { useRecoveryPhraseInputs } from '@tonkeeper/shared/hooks/useRecoveryPhraseInputs';
import { InputNumberPrefix } from '@tonkeeper/shared/components/InputNumberPrefix';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from '@tonkeeper/router/src/imperative';
import { useNavigation } from '@tonkeeper/router';
import { t } from '@tonkeeper/shared/i18n';
import { Screen, Steezy, View, Text, Input, Spacer, Button } from '@tonkeeper/uikit';
import { tk } from '$wallet';

export const BackupCheckPhraseScreen = memo(() => {
  const { words } = useParams<{ words: { index: number; word: string }[] }>();
  const [values, setValues] = useState<Record<string, string>>({});
  const inputs = useRecoveryPhraseInputs(32);
  const nav = useNavigation();

  const isValid = useMemo(() => {
    const word1 = values['0'] ? values['0'].trim() : '';
    const word2 = values['1'] ? values['1'].trim() : '';
    const word3 = values['2'] ? values['2'].trim() : '';

    return word1 === words[0].word && word2 === words[1].word && word3 === words[2].word;
  }, [values, words]);

  const handleSubmit = useCallback(() => {
    if (isValid) {
      tk.wallet.saveLastBackupTimestamp();
      nav.pop(2);
    }
  }, [nav, isValid]);

  const handleSubmitEditing = useCallback(
    (index: number) => () => {
      if (index === 2) {
        handleSubmit();
      } else {
        inputs.getRef(index + 1)?.focus();
      }
    },
    [handleSubmit, inputs],
  );

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

  return (
    <Screen keyboardAvoiding alternateBackground>
      <Screen.Header gradient alternateBackground />
      <Screen.ScrollView
        ref={inputs.scrollViewRef}
        contentContainerStyle={styles.contentContainer.static}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <Screen.HeaderIndent />
        <Text type="h2" textAlign="center">
          {t('backup_check.title')}
        </Text>
        <Spacer y={4} />
        <Text type="body1" color="textSecondary" textAlign="center">
          {t('backup_check.caption', {
            one: words[0].index + 1,
            two: words[1].index + 1,
            three: words[2].index + 1,
          })}
        </Text>
        <Spacer y={16} />
        <View style={styles.inputsContainer}>
          {words.map((item, index) => (
            <View key={`${item.word}-${index}`} onLayout={inputs.setPosition(index)}>
              <Input
                key={`input-${index}`}
                renderToHardwareTextureAndroid
                leftContent={<InputNumberPrefix index={item.index} />}
                returnKeyType={index === 2 ? 'done' : 'next'}
                onChangeText={handleChange(index)}
                onSubmitEditing={handleSubmitEditing(index)}
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
                indentBottom={index !== 2}
              />
            </View>
          ))}
        </View>
        <Screen.ButtonSpacer />
      </Screen.ScrollView>
      <Screen.ButtonContainer>
        <Button
          title={t('backup_check.done_button')}
          onPress={handleSubmit}
          disabled={!isValid}
        />
      </Screen.ButtonContainer>
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
  contentContainer: {
    paddingHorizontal: 32,
  },
  keyboardAccessory: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 16,
  },
});
