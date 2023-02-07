import React, { FC, useMemo } from 'react';
import { ScrollView } from 'react-native';

import * as CreateWalletStyle from '../CreateWallet/CreateWallet.style';
import {NavBar, NavBarHelper, Text} from '$uikit';
import { ns } from '$utils';
import * as S from './BackupWords.style';
import { useTranslator } from '$hooks';
import { BackupWordsProps } from './BackupWords.interface';
import {WordsItemNumberWrapper} from "./BackupWords.style";

export const BackupWords: FC<BackupWordsProps> = ({ route }) => {
  const t = useTranslator();

  const mnemonic = route.params.mnemonic;

  const data = useMemo(() => {
    const words = mnemonic.split(' ');
    return {
      firstColumn: words.splice(0, 12),
      secondColumn: words,
    };
  }, [mnemonic]);

  function renderColumn(words: string[], column: number) {
    return words.map((word, i) => {
      let number = i + 1;
      if (column === 2) {
        number += 12;
      }
      return (
        <S.WordsItem key={i}>
          <S.WordsItemNumberWrapper>
            <Text color="foregroundSecondary" variant="body1">{number}.</Text>
          </S.WordsItemNumberWrapper>
          <Text variant="body1">{word}</Text>
        </S.WordsItem>
      );
    });
  }

  return (
    <>
      <NavBar isTransparent />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: ns(16),
          paddingTop: ns(16),
          paddingBottom: ns(32),
        }}
        showsVerticalScrollIndicator={false}
      >
        <NavBarHelper />
        <S.Content>
          <CreateWalletStyle.TitleWrapper>
            <Text variant="h2" textAlign="center">
              {t('secret_words_title')}
            </Text>
          </CreateWalletStyle.TitleWrapper>
          <CreateWalletStyle.CaptionWrapper>
            <Text variant="body1" color="foregroundSecondary" textAlign="center">
              {t('secret_words_caption')}
            </Text>
          </CreateWalletStyle.CaptionWrapper>
          <S.Words>
            <S.WordsColumn>{renderColumn(data.firstColumn, 1)}</S.WordsColumn>
            <S.WordsColumn>{renderColumn(data.secondColumn, 2)}</S.WordsColumn>
          </S.Words>
        </S.Content>
      </ScrollView>
    </>
  );
};
