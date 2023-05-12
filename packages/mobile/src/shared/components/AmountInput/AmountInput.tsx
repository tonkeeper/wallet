import { SendAmount } from '$core/Send/Send.interface';
import { mainSelector } from '$store/main';
import { walletWalletSelector } from '$store/wallet';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Switch, TextInput } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { formatInputAmount, parseLocaleNumber } from '$utils';
import { cryptoToFiat, fiatToCrypto, formatCryptoCurrency } from '$utils/currency';
import { useTheme, useTranslator } from '$hooks';
import { getNumberFormatSettings } from 'react-native-localize';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LayoutChangeEvent, View } from 'react-native';
import * as S from './AmountInput.style';
import { Button, Text } from '$uikit';
import { SwapButton } from '../SwapButton';
import { formatter } from '$utils/formatter';

export type AmountInputRef = TextInput & { value: string };

interface Props {
  innerRef?: React.MutableRefObject<AmountInputRef | null>;
  decimals: number;
  balance: string;
  currencyTitle: string;
  amount: SendAmount;
  minAmount?: string;
  fiatRate: number;
  hideSwap?: boolean;
  withCoinSelector?: boolean;
  setAmount: React.Dispatch<React.SetStateAction<SendAmount>>;
}

const AmountInputComponent: React.FC<Props> = (props) => {
  const {
    innerRef,
    decimals,
    balance,
    currencyTitle,
    amount,
    fiatRate,
    minAmount,
    hideSwap = false,
    withCoinSelector = false,
    setAmount,
  } = props;

  const textInputRef = useRef<TextInput | null>(null);

  const { fiatCurrency } = useSelector(mainSelector);
  const wallet = useSelector(walletWalletSelector);

  const isLockup = !!wallet?.ton.isLockup();

  const { remainingBalance, balanceInputValue, isInsufficientBalance, isLessThanMin } =
    useMemo(() => {
      const bigNum = new BigNumber(parseLocaleNumber(amount.value) || '0');
      const balanceBigNum = new BigNumber(balance);

      const remainingBalanceBigNum = balanceBigNum.minus(bigNum);

      const remainingBalanceDecimals = remainingBalanceBigNum.isGreaterThanOrEqualTo(1)
        ? 2
        : decimals;

      return {
        remainingBalance: formatter.format(remainingBalanceBigNum, {
          decimals: remainingBalanceDecimals,
          currency: currencyTitle,
          currencySeparator: 'wide',
        }),
        balanceInputValue: formatter.format(balance, {
          decimals,
          currencySeparator: 'wide',
        }),
        isInsufficientBalance: !isLockup && bigNum.isGreaterThan(balanceBigNum),
        isLessThanMin:
          minAmount !== undefined &&
          bigNum.isGreaterThan(0) &&
          bigNum.isLessThan(new BigNumber(minAmount)),
      };
    }, [amount.value, balance, currencyTitle, decimals, isLockup, minAmount]);

  const theme = useTheme();

  const t = useTranslator();

  const [value, setValue] = useState(amount.value);

  const [isFiat, setFiat] = useState(false);

  const isFiatAvailable = !!fiatRate && fiatRate > 0;

  const secondaryAmount = useMemo(() => {
    if (amount.all && isFiat) {
      return formatInputAmount(balance, 2, true);
    }

    const { decimalSeparator } = getNumberFormatSettings();

    const secondaryValue = isFiat
      ? fiatToCrypto(value, fiatRate, 2, true)
      : cryptoToFiat(value, fiatRate, 2, true);

    return secondaryValue === '0' ? `0${decimalSeparator}00` : secondaryValue;
  }, [amount.all, balance, fiatRate, isFiat, value]);

  const mainCurrencyCode = isFiat ? fiatCurrency.toUpperCase() : currencyTitle;
  const secondaryCurrencyCode = isFiat ? currencyTitle : fiatCurrency.toUpperCase();

  const handleChangeAmount = useCallback(
    (text: string) => {
      const nextValue = formatInputAmount(text, decimals);
      setValue(nextValue);

      setAmount({
        value: isFiat ? fiatToCrypto(nextValue, fiatRate, decimals) : nextValue,
        all: nextValue === balanceInputValue,
      });
    },
    [balanceInputValue, decimals, fiatRate, isFiat, setAmount],
  );

  const handlePressInput = useCallback(() => {
    textInputRef.current?.focus();
  }, [textInputRef]);

  const handleSwitchAll = useCallback(() => {
    setAmount((s) => ({
      value: s.all ? '0' : balanceInputValue,
      all: !s.all,
    }));
  }, [balanceInputValue, setAmount]);

  const handleToggleFiat = useCallback(() => {
    if (isFiat) {
      setValue(amount.value);

      setFiat(false);
    } else {
      setValue(cryptoToFiat(amount.value, fiatRate, 2));

      setFiat(true);
    }
  }, [amount.value, fiatRate, isFiat]);

  const amountContainerStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: withSpring(
            interpolate(value.length, [9, 18], [1, 0.6], Extrapolation.CLAMP),
          ),
        },
      ],
    }),
    [value],
  );

  const inputHeight = useSharedValue(0);

  const handleInputLayout = useCallback(
    (event: LayoutChangeEvent) => {
      inputHeight.value = event.nativeEvent.layout.height;
    },
    [inputHeight],
  );

  const handleRef = useCallback(
    (ref: TextInput) => {
      if (innerRef) {
        innerRef.current = ref as AmountInputRef;
      }

      textInputRef.current = ref;
    },
    [innerRef],
  );

  const fakeInputStyle = useAnimatedStyle(() => ({ height: inputHeight.value }));

  useEffect(() => {
    const currentInputValue = isFiat ? fiatToCrypto(value, fiatRate, decimals) : value;

    if (amount.value === currentInputValue) {
      return;
    }

    const nextValue = isFiat ? cryptoToFiat(amount.value, fiatRate, 2) : amount.value;

    setValue(nextValue);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  useEffect(() => {
    if (!isFiatAvailable) {
      setValue(amount.value);

      setFiat(false);
    }
  }, [isFiatAvailable]);

  useEffect(() => {
    if (innerRef?.current) {
      innerRef.current.value = value;
    }
  }, [value]);

  return (
    <>
      <S.InputTouchable onPress={handlePressInput}>
        <S.InputContainer>
          <S.AmountContainer
            style={amountContainerStyle}
            isFiatAvailable={isFiatAvailable}
            withCoinSelector={withCoinSelector}
          >
            <S.FakeInputWrap>
              <S.AmountInput
                ref={handleRef}
                autoCorrect={false}
                selectionColor={theme.colors.accentPrimary}
                keyboardType="numeric"
                value={value}
                onChangeText={handleChangeAmount}
                onLayout={handleInputLayout}
                returnKeyType="next"
              />
              <View pointerEvents="none">
                <S.FakeInput style={fakeInputStyle}>{value}</S.FakeInput>
              </View>
            </S.FakeInputWrap>
            <S.AmountCode>{mainCurrencyCode}</S.AmountCode>
          </S.AmountContainer>
          {isFiatAvailable ? (
            <>
              <S.SecondaryAmountContainer onPress={handleToggleFiat}>
                <Text color="foregroundSecondary" numberOfLines={1}>
                  {secondaryAmount} {secondaryCurrencyCode}
                </Text>
              </S.SecondaryAmountContainer>
              {!hideSwap ? (
                <S.SwapButtonContainer>
                  <SwapButton onPress={handleToggleFiat} />
                </S.SwapButtonContainer>
              ) : null}
            </>
          ) : null}
        </S.InputContainer>
      </S.InputTouchable>
      {!isLockup ? (
        <S.SendAllContainer>
          <Button
            mode={amount.all ? 'primary' : 'secondary'}
            size="small"
            onPress={handleSwitchAll}
          >
            {t('send_screen_steps.amount.max')}
          </Button>
          {isInsufficientBalance || isLessThanMin ? (
            <S.Error>
              {isInsufficientBalance
                ? t('send_screen_steps.amount.insufficient_balance')
                : t('send_screen_steps.amount.less_than_min', { minAmount })}
            </S.Error>
          ) : (
            <S.SandAllLabel>
              {t('send_screen_steps.amount.remaining', {
                amount: remainingBalance,
              })}
            </S.SandAllLabel>
          )}
        </S.SendAllContainer>
      ) : null}
    </>
  );
};

export const AmountInput = memo(AmountInputComponent);
