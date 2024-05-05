import { Button, Screen, Spacer, Text, copyText, Steezy } from '@tonkeeper/uikit';
import { useParams } from '@tonkeeper/router/src/imperative';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { memo, useCallback, useMemo } from 'react';
import { useNavigation } from '@tonkeeper/router';
import { t } from '@tonkeeper/shared/i18n';
import { useWalletSetup } from '@tonkeeper/shared/hooks';
import { MainStackRouteNames } from '$navigation';
import { deviceHeight } from '@tonkeeper/uikit';
import { TTextTypes } from '@tonkeeper/uikit/src/components/Text/TextStyles';
import {
  CreatedStyles,
  ExtractMediaVars,
} from '@bogoslavskiy/react-native-steezy/dist/types';

export interface Sizes {
  title: TTextTypes;
  caption: TTextTypes;
  index: TTextTypes;
  word: TTextTypes;
  styles: CreatedStyles<
    StyleSheet.NamedStyles<{ line: ViewStyle }> & ExtractMediaVars<{ isTablet: unknown }>
  >;
}

const defaultSizes: Sizes = {
  title: 'h2',
  caption: 'body1',
  index: 'body2',
  word: 'body1',
  styles: Steezy.create({
    line: {
      width: 151,
      flexDirection: 'row',
      marginBottom: 8,
      height: 24,
    },
  }),
};

const smallSizes: Sizes = {
  title: 'h3',
  caption: 'body2',
  index: 'body3',
  word: 'body2',
  styles: Steezy.create({
    line: {
      width: 151,
      flexDirection: 'row',
      marginBottom: 4,
      height: 18,
    },
  }),
};

const sizesConfig = deviceHeight >= 650 ? defaultSizes : smallSizes;

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
    <Screen alternateBackground>
      <Screen.Header alternateBackground />
      <Screen.ScrollView>
        <View style={styles.container}>
          <Text type={sizesConfig.title} textAlign="center">
            {t('recovery_phrase.title')}
          </Text>
          <Spacer y={4} />
          <Text type={sizesConfig.caption} color="textSecondary" textAlign="center">
            {t('recovery_phrase.caption')}
          </Text>
          <Spacer y={16} />

          <View style={styles.centered}>
            <View style={styles.columns}>
              <View style={styles.leftColumn}>
                {leftColumn.map((word, index) => (
                  <View style={sizesConfig.styles.line.static} key={`${word}-${index}`}>
                    <Text
                      type={sizesConfig.index}
                      color="textSecondary"
                      style={styles.num}
                    >
                      {index + 1}.
                    </Text>
                    <Text type={sizesConfig.word}>{word}</Text>
                  </View>
                ))}
              </View>
              <View>
                {rightColumn.map((word, index) => (
                  <View
                    style={sizesConfig.styles.line.static}
                    key={`${word}-${index + 1 + 12}`}
                  >
                    <Text
                      type={sizesConfig.index}
                      color="textSecondary"
                      style={styles.num}
                    >
                      {index + 1 + 12}.
                    </Text>
                    <Text type={sizesConfig.word}>{word}</Text>
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
