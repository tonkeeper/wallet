import React, { FC, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as CreateWalletStyle from '../CreateWallet/CreateWallet.style';
import {Button, NavBar, NavBarHelper, Text} from '$uikit';
import { ns } from '$utils';
import { walletSelector } from '$store/wallet';
import * as S from './SecretWords.style';
import { useTranslator } from '$hooks';
import { openCheckSecretWords } from '$navigation';
import {WordsItemNumberWrapper} from "./SecretWords.style";

export const SecretWords: FC = () => {
  const t = useTranslator();
  const { generatedVault } = useSelector(walletSelector);
  const { bottom: bottomInset } = useSafeAreaInsets();

  const data = useMemo(() => {
    const words = generatedVault!.mnemonic.split(' ');
    return {
      firstColumn: words.splice(0, 12),
      secondColumn: words,
    };
  }, [generatedVault]);

  function renderColumn(words: string[], column: number) {
    return words.map((word, i) => {
      let number = i + 1;
      if (column === 2) {
        number += 12;
      }
      return (
        <S.WordsItem key={i}>
          <S.WordsItemNumberWrapper>
            <Text color="foregroundSecondary" variant="body1">
              {number}.
            </Text>
          </S.WordsItemNumberWrapper>
          <S.WordsItemValueWrapper>
            <Text variant="body1">{word}</Text>
          </S.WordsItemValueWrapper>
        </S.WordsItem>
      );
    });
  }

  const handleContinue = useCallback(() => {
    openCheckSecretWords();
  }, []);

  return (
    <View style={{ flex: 1, paddingBottom: bottomInset }}>
      <NavBar isTransparent />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: ns(32)
        }}
        showsVerticalScrollIndicator={false}
      >
        <NavBarHelper />
        <S.Content>
          <Text variant="h2" textAlign="center">
            {t('secret_words_title')}
          </Text>
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
      <View 
        style={{ 
          paddingHorizontal: ns(32), 
          paddingBottom: ns(32),
          paddingTop: 16
        }}>
        <Button onPress={handleContinue}>{t('continue')}</Button>
      </View>
    </View>
  );
};
