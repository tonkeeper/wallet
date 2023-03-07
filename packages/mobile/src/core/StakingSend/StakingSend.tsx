import { SendAmount } from '$core/Send/Send.interface';
import { useFiatValue, useTranslator } from '$hooks';
import { AppStackRouteNames } from '$navigation';
import { AppStackParamList } from '$navigation/AppStack';
import { StepView, StepViewItem, StepViewRef } from '$shared/components';
import { CryptoCurrencies } from '$shared/constants';
import { NavBar } from '$uikit';
import { delay, parseLocaleNumber } from '$utils';
import { RouteProp } from '@react-navigation/native';
import BigNumber from 'bignumber.js';
import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { AmountStep, ConfirmStep } from './steps';
import { StakingSendSteps } from './types';

const getMessage = (provider: string, amount: string, isWithdrawal?: boolean) => {
  if (provider === 'whales') {
    return isWithdrawal ? `Request withdraw of ${amount} TON asdasdasd` : 'Deposit';
  }
  if (provider === 'tf') {
    return isWithdrawal ? 'w' : 'Deposit';
  }

  return '';
};

interface Props {
  route: RouteProp<AppStackParamList, AppStackRouteNames.StakingSend>;
}

export const StakingSend: FC<Props> = (props) => {
  const {
    route: {
      params: { isWithdrawal = false },
    },
  } = props;

  const apy = 6.79608;

  const providerId = 'whales';

  const stakingBalance = '100';

  const t = useTranslator();

  const stepViewRef = useRef<StepViewRef>(null);

  const [currentStep, setCurrentStep] = useState<{
    id: StakingSendSteps;
    index: number;
  }>({
    id: StakingSendSteps.AMOUNT,
    index: 0,
  });

  const stepsScrollTop = useSharedValue(
    Object.keys(StakingSendSteps).reduce(
      (acc, cur) => ({ ...acc, [cur]: 0 }),
      {} as Record<StakingSendSteps, number>,
    ),
  );

  const scrollTop = useDerivedValue<number>(
    () => stepsScrollTop.value[currentStep.id] || 0,
  );

  const [amount, setAmount] = useState<SendAmount>({ value: '0', all: false });

  const [isPreparing, setPreparing] = useState(false);
  const [isSending, setSending] = useState(false);

  const message = getMessage(providerId, amount.value, isWithdrawal);

  const estimatedTopUp = useMemo(() => {
    const apyBN = new BigNumber(apy).dividedBy(100);
    const bigNum = new BigNumber(parseLocaleNumber(amount.value || '0'));

    return bigNum.plus(bigNum.multipliedBy(apyBN)).toFixed(2);
  }, [amount.value]);

  const afterTopUpReward = useFiatValue(CryptoCurrencies.Ton, estimatedTopUp);
  const currentReward = useFiatValue(CryptoCurrencies.Ton, '0');

  const handleBack = useCallback(() => stepViewRef.current?.goBack(), []);

  const handleChangeStep = useCallback((id: string | number, index: number) => {
    setCurrentStep({ id: id as StakingSendSteps, index });
  }, []);

  const hideBackButton = currentStep.index === 0;

  const hideTitle = currentStep.id === StakingSendSteps.CONFIRM;

  const prepareConfirmSending = useCallback(async () => {
    console.log('todo');

    stepViewRef.current?.go(StakingSendSteps.CONFIRM);
  }, []);

  const sendTx = useCallback(async () => {
    await delay(3000);
  }, []);

  const title = isWithdrawal ? t('staking.withdrawal_request') : t('staking.top_up');

  return (
    <>
      <NavBar
        isModal
        isClosedButton
        isForceBackIcon
        hideBackButton={hideBackButton}
        hideTitle={hideTitle}
        scrollTop={scrollTop}
        onBackPress={handleBack}
      >
        {title}
      </NavBar>
      <StepView
        ref={stepViewRef}
        backDisabled={isSending || isPreparing}
        onChangeStep={handleChangeStep}
        initialStepId={StakingSendSteps.AMOUNT}
        useBackHandler
      >
        <StepViewItem id={StakingSendSteps.AMOUNT}>
          {(stepProps) => (
            <AmountStep
              isWithdrawal={isWithdrawal}
              isPreparing={isPreparing}
              amount={amount}
              stakingBalance={stakingBalance}
              stepsScrollTop={stepsScrollTop}
              afterTopUpReward={afterTopUpReward}
              currentReward={currentReward}
              setAmount={setAmount}
              onContinue={prepareConfirmSending}
              {...stepProps}
            />
          )}
        </StepViewItem>
        <StepViewItem id={StakingSendSteps.CONFIRM}>
          {(stepProps) => (
            <ConfirmStep
              isWithdrawal={isWithdrawal}
              message={message}
              amount={amount}
              stepsScrollTop={stepsScrollTop}
              sendTx={sendTx}
              {...stepProps}
            />
          )}
        </StepViewItem>
      </StepView>
    </>
  );
};
