import { useReanimatedKeyboardHeight, useTheme, useTranslator } from '$hooks';
import { Button, Text } from '$uikit';
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as S from './AmountStep.style';
import { RecipientView } from './components/RecipientView/RecipientView';
import { formatInputAmount, parseLocaleNumber } from '$utils';
import { formatCryptoCurrency, cryptoToFiat, fiatToCrypto } from '$utils/currency';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { mainSelector } from '$store/main';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { AmountStepProps } from './AmountStep.interface';
import { SwapButton } from './components/SwapButton/SwapButton';
import { getNumberFormatSettings } from 'react-native-localize';
import { Switch, TextInput } from 'react-native-gesture-handler';
import { walletWalletSelector } from '$store/wallet';

const AmountStepComponent: FC<AmountStepProps> = (props) => {
  const {
    isPreparing,
    active,
    recipient,
    recipientAccountInfo,
    decimals,
    balance,
    currencyTitle,
    amount,
    fiatRate,
    setAmount,
    goToAddress,
    onContinue,
  } = props;

  const { fiatCurrency } = useSelector(mainSelector);
  const wallet = useSelector(walletWalletSelector);

  const isLockup = !!wallet?.ton.isLockup();

  const {
    formattedBalance,
    balanceInputValue,
    isInsufficientBalance,
    isReadyToContinue,
  } = useMemo(() => {
    const bigNum = new BigNumber(parseLocaleNumber(amount.value));
    const balanceBigNum = new BigNumber(balance);

    const formattedBalanceDecimals = balanceBigNum.isGreaterThanOrEqualTo(1)
      ? 2
      : decimals;

    return {
      formattedBalance: formatCryptoCurrency(
        balance,
        currencyTitle,
        formattedBalanceDecimals,
      ),
      balanceInputValue: formatInputAmount(balance, decimals),
      isInsufficientBalance: !isLockup && bigNum.isGreaterThan(balanceBigNum),
      isReadyToContinue:
        bigNum.isGreaterThan(0) && (isLockup || bigNum.isLessThanOrEqualTo(balance)),
    };
  }, [amount.value, balance, currencyTitle, decimals, isLockup]);

  const { keyboardHeightStyle } = useReanimatedKeyboardHeight();

  const { bottom: bottomInset } = useSafeAreaInsets();

  const theme = useTheme();

  const t = useTranslator();

  const textInputRef = useRef<TextInput>(null);

  const [value, setValue] = useState(amount.value);

  const [isFiat, setFiat] = useState(false);

  const isFiatAvailable = !!fiatRate && fiatRate > 0;

  const secondaryAmount = useMemo(() => {
    if (amount.all && isFiat) {
      return formatInputAmount(balance, 2);
    }

    const { decimalSeparator } = getNumberFormatSettings();

    const secondaryValue = isFiat
      ? fiatToCrypto(value, fiatRate, 2)
      : cryptoToFiat(value, fiatRate, 2);

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
  }, []);

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
    <S.Container bottomInset={bottomInset} style={keyboardHeightStyle}>
      <RecipientView
        recipient={recipient}
        recipientAccountInfo={recipientAccountInfo}
        goToAddress={goToAddress}
      />
      <S.InputTouchable onPress={handlePressInput}>
        <S.InputContainer>
          <S.AmountContainer
            style={amountContainerStyle}
            isFiatAvailable={isFiatAvailable}
          >
            <S.FakeInputWrap>
              <S.AmountInput
                ref={textInputRef}
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
                <Text color="foregroundSecondary">
                  {secondaryAmount} {secondaryCurrencyCode}
                </Text>
              </S.SecondaryAmountContainer>
              <S.SwapButtonContainer>
                <SwapButton onPress={handleToggleFiat} />
              </S.SwapButtonContainer>
            </>
          ) : null}
          {isInsufficientBalance ? (
            <S.Error>{t('send_screen_steps.amount.insufficient_balance')}</S.Error>
          ) : null}
        </S.InputContainer>
      </S.InputTouchable>
      {!isLockup ? (
        <S.SendAllContainer>
          <Switch
            thumbColor={theme.colors.foregroundPrimary}
            trackColor={{
              false: theme.colors.backgroundSecondary,
              true: theme.colors.accentPrimary,
            }}
            value={amount.all}
            onChange={handleSwitchAll}
          />
          <S.SandAllLabel>
            {t('send_screen_steps.amount.send_all', {
              amount: formattedBalance,
            })}
          </S.SandAllLabel>
        </S.SendAllContainer>
      ) : null}
      <Button disabled={!isReadyToContinue} isLoading={isPreparing} onPress={onContinue}>
        {t('continue')}
      </Button>
    </S.Container>
  );
};

export const AmountStep = memo(AmountStepComponent);
