import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Screen, Spacer, Text, copyText } from '@tonkeeper/uikit';
import { useParams } from '@tonkeeper/router/src/imperative';
import { View, StyleSheet } from 'react-native';
import { memo, useCallback, useMemo } from 'react';
import { useNavigation } from '@tonkeeper/router';
import { t } from '@tonkeeper/shared/i18n';
import { useWalletSetup } from '@tonkeeper/shared/hooks';
import { MainStackRouteNames } from '$navigation';

function getRandIndexes(length: number, indexes: number[] = []) {
  if (indexes.length === length) {
    return indexes.sort((a, b) => a - b);
  }

  const randIndex = Math.floor(Math.random() * 23);
  if (!indexes.includes(randIndex)) {
    indexes.push(randIndex);
  }

  return getRandIndexes(length, indexes);
}

export const BackupPhraseScreen = memo(() => {
  const params = useParams<{ mnemonic: string; isBackupAgain?: boolean }>();
  const safeArea = useSafeAreaInsets();
  const nav = useNavigation();

  const mnemonic = params.mnemonic!;

  const { lastBackupAt } = useWalletSetup();

  const phrase = useMemo(() => mnemonic.split(' '), [mnemonic]);
  const leftColumn = useMemo(() => phrase.slice(0, 12), [phrase]);
  const rightColumn = useMemo(() => phrase.slice(12, 24), [phrase]);

  const getRandomWords = useCallback(() => {
    return getRandIndexes(3).map((index) => ({ word: phrase[index], index }));
  }, [phrase]);

  return (
    <Screen>
      <Screen.Header />
      <Screen.ScrollView>
        <View style={styles.container}>
          <Text type="h2" textAlign="center">
            {t('recovery_phrase.title')}
          </Text>
          <Spacer y={4} />
          <Text type="body1" color="textSecondary" textAlign="center">
            {t('recovery_phrase.caption')}
          </Text>
          <Spacer y={16} />

          <View style={styles.centered}>
            <View style={styles.columns}>
              <View style={styles.leftColumn}>
                {leftColumn.map((word, index) => (
                  <View style={styles.line} key={`${word}-${index}`}>
                    <Text type="body2" color="textSecondary" style={styles.num}>
                      {index + 1}.
                    </Text>
                    <Text type="body1">{word}</Text>
                  </View>
                ))}
              </View>
              <View>
                {rightColumn.map((word, index) => (
                  <View style={styles.line} key={`${word}-${index + 1 + 12}`}>
                    <Text type="body2" color="textSecondary" style={styles.num}>
                      {index + 1 + 12}.
                    </Text>
                    <Text type="body1">{word}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
        <Screen.ButtonSpacer />
      </Screen.ScrollView>
      <Screen.ButtonContainer>
        {lastBackupAt !== null && !params.isBackupAgain ? (
          <Button
            title={t('recovery_phrase.copy_button')}
            onPress={copyText(mnemonic)}
            color="secondary"
          />
        ) : (
          <Button
            title={t('recovery_phrase.check_button')}
            onPress={() =>
              nav.navigate(MainStackRouteNames.BackupCheckPhrase, {
                words: getRandomWords(),
              })
            }
          />
        )}
      </Screen.ButtonContainer>
    </Screen>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  columns: {
    flexDirection: 'row',
    maxWidth: 310,
    paddingVertical: 16,
  },
  line: {
    width: 151,
    flexDirection: 'row',
    marginBottom: 8,
    height: 24,
  },
  leftColumn: {
    paddingHorizontal: 16,
  },
  num: {
    width: 24,
    height: 23,
    marginRight: 4,
    position: 'relative',
    top: 3,
  },
});
