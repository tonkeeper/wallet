import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Screen, Spacer, Text, copyText } from '@tonkeeper/uikit';
import { useParams } from '@tonkeeper/router/src/imperative';
import { View, StyleSheet } from 'react-native';
import { memo, useCallback, useMemo } from 'react';
import { useNavigation } from '@tonkeeper/router';
import { useNewWallet } from '@tonkeeper/shared/hooks/useNewWallet';

function getRandIndexes(length: number, indexes: number[] = []) {
  if (indexes.length === length) {
    return indexes;
  }

  const randIndex = Math.floor(Math.random() * 23);
  if (!indexes.includes(randIndex)) {
    indexes.push(randIndex);
  }

  return getRandIndexes(length, indexes);
}

export const BackupPhraseScreen = memo(() => {
  const wallet = useNewWallet();
  const params = useParams<{ phrase: string; isBackupAgain?: boolean }>();
  const safeArea = useSafeAreaInsets();
  const nav = useNavigation();

  const phrase = useMemo(() => params.phrase.split(' '), [params.phrase]);
  const leftColumn = useMemo(() => phrase.slice(0, 12), [phrase]);
  const rightColumn = useMemo(() => phrase.slice(12, 24), [phrase]);

  const getRandomWords = useCallback(() => {
    return getRandIndexes(3).map((index) => ({ word: phrase[index], index }));
  }, [phrase]);

  return (
    <Screen>
      <Screen.Header />
      <View style={styles.container}>
        <Text type="h2" textAlign="center">
          Recovery Phrase
        </Text>
        <Spacer y={4} />
        <Text type="body1" color="textSecondary" textAlign="center">
          Write down these words with their numbers and store them in a safe place.
        </Text>
        <Spacer y={16} />

        <View style={styles.phraseContaniner}>
          <View style={styles.leftColumn}>
            {leftColumn.map((word, index) => (
              <View style={styles.column} key={`${word}-${index}`}>
                <Text type="body2" color="textSecondary" style={styles.num}>
                  {index + 1}.
                </Text>
                <Text type="body1">{word}</Text>
              </View>
            ))}
          </View>
          <View>
            {rightColumn.map((word, index) => (
              <View style={styles.column} key={`${word}-${index + 1 + 12}`}>
                <Text type="body2" color="textSecondary" style={styles.num}>
                  {index + 1 + 12}.
                </Text>
                <Text type="body1">{word}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={[styles.buttonContainer, { paddingBottom: safeArea.bottom + 16 }]}>
        {wallet.lastBackupTimestamp !== null && !params.isBackupAgain ? (
          <Button title="Copy" color="secondary" onPress={copyText(params.phrase)} />
        ) : (
          <Button
            title="Check Backup"
            onPress={() =>
              nav.navigate('/backup-check-phrase', { words: getRandomWords() })
            }
          />
        )}
      </View>
    </Screen>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flex: 1,
  },
  phraseContaniner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  column: {
    width: 151,
    flexDirection: 'row',
  },
  leftColumn: {
    marginLeft: 24,
  },
  num: {
    width: 23,
    height: 24,
  },
  buttonContainer: {
    marginTop: 16,
    marginHorizontal: 32,
  },
});
