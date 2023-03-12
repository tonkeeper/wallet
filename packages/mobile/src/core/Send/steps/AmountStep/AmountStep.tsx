import { useReanimatedKeyboardHeight, useTranslator } from '$hooks';
import { Button, Spacer } from '$uikit';
import React, { FC, memo, useEffect, useMemo, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as S from './AmountStep.style';
import { RecipientView } from './RecipientView/RecipientView';
import { parseLocaleNumber } from '$utils';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { AmountStepProps } from './AmountStep.interface';
import { TextInput } from 'react-native-gesture-handler';
import { walletWalletSelector } from '$store/wallet';
import { AmountInput } from '$shared/components';

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

  const { bottom: bottomInset } = useSafeAreaInsets();

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
    <S.Container bottomInset={bottomInset} style={keyboardHeightStyle}>
      <RecipientView
        recipient={recipient}
        recipientAccountInfo={recipientAccountInfo}
        goToAddress={goToAddress}
      />
      <Spacer y={16} />
      <AmountInput
        innerRef={textInputRef}
        {...{ decimals, balance, currencyTitle, amount, fiatRate, setAmount }}
      />
      <Spacer y={16} />
      <Button disabled={!isReadyToContinue} isLoading={isPreparing} onPress={onContinue}>
        {t('continue')}
      </Button>
    </S.Container>
  );
};

export const AmountStep = memo(AmountStepComponent);
