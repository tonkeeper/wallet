import { SendAmount } from '$core/Send/Send.interface';
import { walletWalletSelector } from '$store/wallet';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TextInput } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { formatInputAmount, parseLocaleNumber } from '$utils';
import { cryptoToFiat, fiatToCrypto, trimZeroDecimals } from '$utils/currency';
import { useTheme } from '$hooks/useTheme';
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
import { useHideableFormatter } from '$core/HideableAmount/useHideableFormatter';
import { t } from '@tonkeeper/shared/i18n';
import { useWallet, useWalletCurrency } from '@tonkeeper/shared/hooks';

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
  disabled?: boolean;
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
    disabled,
    setAmount,
  } = props;

  const { format } = useHideableFormatter();

  const textInputRef = useRef<TextInput | null>(null);

  const fiatCurrency = useWalletCurrency();
  const wallet = useWallet();

  const isLockup = !!wallet?.isLockup;

  const { remainingBalance, balanceInputValue, isInsufficientBalance, isLessThanMin } =
    useMemo(() => {
      const bigNum = new BigNumber(parseLocaleNumber(amount.value) || '0');
      const balanceBigNum = new BigNumber(balance);

      const remainingBalanceBigNum = balanceBigNum.minus(bigNum);

      const remainingBalanceDecimals = remainingBalanceBigNum.isGreaterThanOrEqualTo(1)
        ? 2
        : decimals;

      return {
        remainingBalance: format(remainingBalanceBigNum, {
          decimals: remainingBalanceDecimals,
          currency: currencyTitle,
          currencySeparator: 'wide',
        }),
        balanceInputValue: formatter.format(balance, {
          decimals,
          withoutTruncate: true,
          currencySeparator: 'wide',
        }),
        isInsufficientBalance: !isLockup && bigNum.isGreaterThan(balanceBigNum),
        isLessThanMin:
          minAmount !== undefined &&
          bigNum.isGreaterThan(0) &&
          bigNum.isLessThan(new BigNumber(minAmount)),
      };
    }, [amount.value, balance, currencyTitle, decimals, format, isLockup, minAmount]);

  const theme = useTheme();

  const [value, setValue] = useState(amount.value);

  const [isFiat, setFiat] = useState(false);

  const isFiatAvailable = !!fiatRate && fiatRate > 0;

  const secondaryAmount = useMemo(() => {
    if (amount.all && isFiat) {
      return formatInputAmount(formatter.format(balance), 2, true);
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
      if (disabled) {
        return;
      }

      const nextValue = formatInputAmount(text, decimals);
      setValue(nextValue);

      setAmount({
        value: isFiat ? fiatToCrypto(nextValue, fiatRate, decimals) : nextValue,
        all: nextValue === balanceInputValue,
      });
    },
    [balanceInputValue, decimals, disabled, fiatRate, isFiat, setAmount],
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
      setValue(trimZeroDecimals(amount.value));

      setFiat(false);
    } else {
      setValue(trimZeroDecimals(cryptoToFiat(amount.value, fiatRate, 2)));

      setFiat(true);
    }
  }, [amount.value, fiatRate, isFiat]);

  const amountContainerStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: withSpring(
            interpolate(
              value.length + Math.max(mainCurrencyCode.length - 3, 0),
              [9, 21, 30, 40],
              [1, 0.6, 0.5, 0.4],
              Extrapolation.CLAMP,
            ),
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
    setFiat(false);
    setValue('0');
  }, [currencyTitle]);

  useEffect(() => {
    if (innerRef?.current) {
      innerRef.current.value = value;
    }
  }, [innerRef, value]);

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
