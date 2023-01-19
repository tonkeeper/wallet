import { SendSteps } from '$core/Send/Send.interface';
import { useJettonBalances, useTranslator } from '$hooks';
import { CryptoCurrencies, SecondaryCryptoCurrencies } from '$shared/constants';
import { walletSelector } from '$store/wallet';
import React, { FC, memo, useMemo } from 'react';
import { useAnimatedScrollHandler } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { ChooseCoinStepProps } from './ChooseCoinStep.interface';
import * as S from './ChooseCoinStep.style';
import { CurrencyItem } from './CurrencyItem';
import { JettonItem } from './JettonItem';

const ChooseCoinStepComponent: FC<ChooseCoinStepProps> = (props) => {
  const { active, stepsScrollTop, onChangeCurrency } = props;

  const t = useTranslator();

  const { currencies, balances } = useSelector(walletSelector);

  const otherCurrencies = useMemo(() => {
    const list = [...SecondaryCryptoCurrencies];

    return list.filter((item) => {
      if (item === CryptoCurrencies.Ton) {
        return false;
      }

      if (+balances[item] > 0) {
        return true;
      }

      return currencies.indexOf(item) > -1;
    });
  }, [currencies, balances]);

  const jettons = useJettonBalances();

  const scrollHandler = useAnimatedScrollHandler((event) => {
    stepsScrollTop.value = {
      ...stepsScrollTop.value,
      [SendSteps.CHOOSE_TOKEN]: event.contentOffset.y,
    };
  });

  return (
    <S.Container onScroll={scrollHandler} active={active}>
      <S.TitleContainer>
        <S.Title>{t('send_screen_steps.choose_coin.title')}</S.Title>
        <S.SubTitle>{t('send_screen_steps.choose_coin.subtitle')}</S.SubTitle>
      </S.TitleContainer>
      <CurrencyItem
        currency={CryptoCurrencies.Ton}
        onPress={() => onChangeCurrency(CryptoCurrencies.Ton)}
        borderEnd={otherCurrencies.length === 0}
      />
      {otherCurrencies.map((currency, index) => (
        <CurrencyItem
          key={currency}
          currency={currency}
          borderStart={index === 0}
          borderEnd={otherCurrencies.length - 1 === index}
        />
      ))}
      {jettons.map((jetton, index) => (
        <JettonItem
          key={jetton.jettonAddress}
          jetton={jetton}
          onPress={() => onChangeCurrency(jetton.jettonAddress, true)}
          borderStart={index === 0}
          borderEnd={jettons.length - 1 === index}
        />
      ))}
    </S.Container>
  );
};

export const ChooseCoinStep = memo(ChooseCoinStepComponent);
