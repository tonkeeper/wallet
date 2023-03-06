import {
  useFiatRate,
  useFiatValue,
  useReanimatedKeyboardHeight,
  useTranslator,
} from '$hooks';
import { Button, Separator, Spacer, Text } from '$uikit';
import React, { FC, memo, useEffect, useMemo, useRef } from 'react';
import * as S from './AmountStep.style';
import { parseLocaleNumber } from '$utils';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { TextInput } from 'react-native-gesture-handler';
import { walletWalletSelector } from '$store/wallet';
import {
  AmountInput,
  BottomButtonWrap,
  BottomButtonWrapHelper,
  StepScrollView,
} from '$shared/components';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import { SendAmount } from '$core/Send/Send.interface';
import { CryptoCurrencies } from '$shared/constants';
import { useCurrencyToSend } from '$hooks/useCurrencyToSend';
import { SharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { StakingTopUpSteps } from '$core/StakingTopUp/types';

interface Props extends StepComponentProps {
  isPreparing: boolean;
  amount: SendAmount;
  stepsScrollTop: SharedValue<Record<StakingTopUpSteps, number>>;
  afterTopUpReward: ReturnType<typeof useFiatValue>;
  currentReward: ReturnType<typeof useFiatValue>;
  setAmount: React.Dispatch<React.SetStateAction<SendAmount>>;
  onContinue: () => void;
}

const AmountStepComponent: FC<Props> = (props) => {
  const {
    isPreparing,
    active,
    amount,
    stepsScrollTop,
    afterTopUpReward,
    setAmount,
    onContinue,
  } = props;

  const fiatRate = useFiatRate(CryptoCurrencies.Ton);

  const { decimals, balance, currencyTitle } = useCurrencyToSend(CryptoCurrencies.Ton);

  const wallet = useSelector(walletWalletSelector);

  const isLockup = !!wallet?.ton.isLockup();

  const { isReadyToContinue } = useMemo(() => {
    const bigNum = new BigNumber(parseLocaleNumber(amount.value));
    return {
      isReadyToContinue:
        bigNum.isGreaterThan(0) && (isLockup || bigNum.isLessThanOrEqualTo(balance)),
    };
  }, [amount.value, balance, isLockup]);

  const { keyboardHeightStyle } = useReanimatedKeyboardHeight();

  const scrollHandler = useAnimatedScrollHandler((event) => {
    stepsScrollTop.value = {
      ...stepsScrollTop.value,
      [StakingTopUpSteps.AMOUNT]: event.contentOffset.y,
    };
  });

  const t = useTranslator();

  const textInputRef = useRef<TextInput>(null);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      if (active) {
        const timeoutId = setTimeout(() => {
          textInputRef.current?.focus();
        }, 400);

        return () => clearTimeout(timeoutId);
      }
    }

    if (active) {
      textInputRef.current?.focus();
      return;
    }

    const timeoutId = setTimeout(() => {
      textInputRef.current?.blur();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [active]);

  return (
    <S.Container style={keyboardHeightStyle}>
      <StepScrollView onScroll={scrollHandler} active={active}>
        <S.Content>
          <S.InputContainer>
            <AmountInput
              innerRef={textInputRef}
              hideSwap={true}
              {...{
                decimals,
                balance,
                currencyTitle,
                amount,
                fiatRate: fiatRate.today,
                setAmount,
              }}
            />
          </S.InputContainer>
          <Spacer y={16} />
          <S.TitleContainer>
            <Text variant="label1">{t('staking.rewards.title')}</Text>
          </S.TitleContainer>
          <S.Table>
            <S.Item>
              <S.ItemLabel numberOfLines={1}>
                {t('staking.rewards.after_top_up')}
              </S.ItemLabel>
              <S.ItemContent>
                <S.ItemValue>
                  {t('staking.rewards.value', { value: afterTopUpReward.amount })}
                </S.ItemValue>
                <S.ItemSubValue>{afterTopUpReward.fiatInfo.amount}</S.ItemSubValue>
              </S.ItemContent>
            </S.Item>
            <Separator />
            <S.Item>
              <S.ItemLabel numberOfLines={1}>{t('staking.rewards.current')}</S.ItemLabel>
              <S.ItemContent>
                <S.ItemValue>{t('staking.rewards.value', { value: 0 })}</S.ItemValue>
                <S.ItemSubValue>
                  {t('staking.rewards.value', { value: 0 })}
                </S.ItemSubValue>
              </S.ItemContent>
            </S.Item>
          </S.Table>
          <Spacer y={16} />
        </S.Content>
        <BottomButtonWrapHelper />
      </StepScrollView>
      <BottomButtonWrap>
        <Button
          disabled={!isReadyToContinue}
          isLoading={isPreparing}
          onPress={onContinue}
        >
          {t('continue')}
        </Button>
      </BottomButtonWrap>
    </S.Container>
  );
};

export const AmountStep = memo(AmountStepComponent);
