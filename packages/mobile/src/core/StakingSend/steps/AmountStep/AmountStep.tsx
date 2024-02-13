import { useFiatValue } from '$hooks/useFiatValue';
import { useReanimatedKeyboardHeight } from '$hooks/useKeyboardHeight';
import { useTokenPrice } from '$hooks/useTokenPrice';
import { Button, Spacer, Text } from '$uikit';
import React, { FC, memo, useEffect, useMemo, useRef } from 'react';
import * as S from './AmountStep.style';
import { parseLocaleNumber } from '$utils';
import BigNumber from 'bignumber.js';
import { TextInput } from 'react-native-gesture-handler';
import {
  AmountInput,
  BottomButtonWrap,
  BottomButtonWrapHelper,
  NextCycle,
  StepScrollView,
} from '$shared/components';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import { SendAmount, TokenType } from '$core/Send/Send.interface';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { useCurrencyToSend } from '$hooks/useCurrencyToSend';
import { SharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { StakingSendSteps } from '$core/StakingSend/types';
import { Ton } from '$libs/Ton';
import { stakingFormatter } from '$utils/formatter';
import { t } from '@tonkeeper/shared/i18n';
import { PoolInfo, PoolImplementationType } from '@tonkeeper/core/src/TonAPI';
import { useWallet } from '@tonkeeper/shared/hooks';

interface Props extends StepComponentProps {
  pool: PoolInfo;
  isWithdrawal: boolean;
  stakingBalance: string;
  isPreparing: boolean;
  amount: SendAmount;
  currency: CryptoCurrencies;
  tokenType: TokenType;
  stepsScrollTop: SharedValue<Record<StakingSendSteps, number>>;
  afterTopUpReward: ReturnType<typeof useFiatValue>;
  currentReward: ReturnType<typeof useFiatValue>;
  setAmount: React.Dispatch<React.SetStateAction<SendAmount>>;
  onContinue: () => void;
}

const AmountStepComponent: FC<Props> = (props) => {
  const {
    pool,
    isWithdrawal,
    stakingBalance,
    isPreparing,
    active,
    amount,
    currency,
    tokenType,
    stepsScrollTop,
    afterTopUpReward,
    currentReward,
    setAmount,
    onContinue,
  } = props;

  const tokenPrice = useTokenPrice(currency);

  const {
    price,
    balance: tonBalance,
    isLiquidJetton,
  } = useCurrencyToSend(currency, tokenType);

  const availableTonBalance = useMemo(() => {
    if (pool.implementation === PoolImplementationType.LiquidTF && !isWithdrawal) {
      const tonAmount = new BigNumber(tonBalance).minus(1.2);

      return tonAmount.isGreaterThanOrEqualTo(0)
        ? tonAmount.decimalPlaces(Decimals[CryptoCurrencies.Ton]).toString()
        : '0';
    }

    return tonBalance;
  }, [isWithdrawal, pool.implementation, tonBalance]);

  const walletBalance = isLiquidJetton ? price!.totalTon : availableTonBalance;

  const minAmount = isWithdrawal ? '0' : Ton.fromNano(pool.min_stake);

  const balance =
    isWithdrawal && pool.implementation !== PoolImplementationType.LiquidTF
      ? stakingBalance
      : walletBalance;

  const wallet = useWallet();

  const isLockup = wallet.isLockup;

  const { isReadyToContinue } = useMemo(() => {
    const bigNum = new BigNumber(parseLocaleNumber(amount.value));
    return {
      isReadyToContinue:
        bigNum.isGreaterThan(0) &&
        (isLockup || bigNum.isLessThanOrEqualTo(balance)) &&
        bigNum.isGreaterThanOrEqualTo(new BigNumber(minAmount)),
    };
  }, [amount.value, balance, isLockup, minAmount]);

  const { keyboardHeightStyle } = useReanimatedKeyboardHeight();

  const scrollHandler = useAnimatedScrollHandler((event) => {
    stepsScrollTop.value = {
      ...stepsScrollTop.value,
      [StakingSendSteps.AMOUNT]: event.contentOffset.y,
    };
  });

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
              disabled={isPreparing}
              hideSwap={true}
              currencyTitle={CryptoCurrencies.Ton.toUpperCase()}
              decimals={Decimals[CryptoCurrencies.Ton]}
              {...{
                balance,
                amount,
                minAmount,
                fiatRate: tokenPrice.fiat,
                setAmount,
              }}
            />
          </S.InputContainer>
          <Spacer y={16} />
          {isWithdrawal ? (
            <NextCycle pool={pool} />
          ) : (
            <>
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
                      {t('staking.rewards.value', {
                        value: stakingFormatter.format(afterTopUpReward.amount),
                      })}
                    </S.ItemValue>
                  </S.ItemContent>
                </S.Item>
                <S.Item>
                  <S.ItemLabel numberOfLines={1}>
                    {t('staking.rewards.current')}
                  </S.ItemLabel>
                  <S.ItemContent>
                    <S.ItemValue>
                      {t('staking.rewards.value', {
                        value: stakingFormatter.format(currentReward.amount),
                      })}
                    </S.ItemValue>
                  </S.ItemContent>
                </S.Item>
              </S.Table>
            </>
          )}
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
