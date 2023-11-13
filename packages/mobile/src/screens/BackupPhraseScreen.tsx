import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Screen, Spacer, Text, copyText } from '@tonkeeper/uikit';
import { useParams } from '@tonkeeper/router/src/imperative';
import { View, StyleSheet } from 'react-native';
import { memo, useCallback, useMemo } from 'react';
import { useNavigation } from '@tonkeeper/router';

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

export const BackupPhraseScreen = memo(() => {
  const params = useParams<{ phrase: string }>();
  const safeArea = useSafeAreaInsets();
  const nav = useNavigation();

  const leftColumn = useMemo(() => {
    return params.phrase!.split(' ').slice(0, 12);
  }, [params.phrase]);

  const rightColumn = useMemo(() => {
    return params.phrase!.split(' ').slice(12, 24);
  }, [params.phrase]);

  const getRandomWords = useCallback(() => {
    const obj = params.phrase!.split(' ').reduce((acc, word) => {
      if (Object.keys(acc).length < 3) {
        const randIndex = getRandomInt(24);
        if (acc[randIndex] === undefined) {
          acc[randIndex] = word;
        }
      }

      return acc;
    }, {});

    return Object.keys(obj).map((index) => ({
      word: obj[index],
      index: Number(index),
    }));
  }, [params.phrase]);

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
        <Button
          title="Check Backup"
          onPress={() =>
            nav.navigate('/backup-check-phrase', { words: getRandomWords() })
          }
        />
        {/* <Button title="Copy" color="secondary" onPress={copyText(params.phrase)} /> */}
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
