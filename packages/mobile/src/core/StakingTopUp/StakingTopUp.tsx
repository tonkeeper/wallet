import { SendAmount } from '$core/Send/Send.interface';
import { useFiatValue, useTranslator } from '$hooks';
import { StepView, StepViewItem, StepViewRef } from '$shared/components';
import { CryptoCurrencies } from '$shared/constants';
import { NavBar } from '$uikit';
import { delay, parseLocaleNumber } from '$utils';
import BigNumber from 'bignumber.js';
import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { AmountStep, ConfirmStep } from './steps';
import { StakingTopUpSteps } from './types';

interface Props {}

export const StakingTopUp: FC<Props> = () => {
  const apy = 6.79608;

  const message = 'Deposit';

  const t = useTranslator();

  const stepViewRef = useRef<StepViewRef>(null);

  const [currentStep, setCurrentStep] = useState<{
    id: StakingTopUpSteps;
    index: number;
  }>({
    id: StakingTopUpSteps.AMOUNT,
    index: 0,
  });

  const stepsScrollTop = useSharedValue(
    Object.keys(StakingTopUpSteps).reduce(
      (acc, cur) => ({ ...acc, [cur]: 0 }),
      {} as Record<StakingTopUpSteps, number>,
    ),
  );

  const scrollTop = useDerivedValue<number>(
    () => stepsScrollTop.value[currentStep.id] || 0,
  );

  const [amount, setAmount] = useState<SendAmount>({ value: '0', all: false });

  const [isPreparing, setPreparing] = useState(false);
  const [isSending, setSending] = useState(false);

  const estimatedTopUp = useMemo(() => {
    const apyBN = new BigNumber(apy).dividedBy(100);
    const bigNum = new BigNumber(parseLocaleNumber(amount.value || '0'));

    return bigNum.plus(bigNum.multipliedBy(apyBN)).toFixed(2);
  }, [amount.value]);

  const afterTopUpReward = useFiatValue(CryptoCurrencies.Ton, estimatedTopUp);
  const currentReward = useFiatValue(CryptoCurrencies.Ton, '0');

  const handleBack = useCallback(() => stepViewRef.current?.goBack(), []);

  const handleChangeStep = useCallback((id: string | number, index: number) => {
    setCurrentStep({ id: id as StakingTopUpSteps, index });
  }, []);

  const hideBackButton = currentStep.index === 0;

  const hideTitle = currentStep.id === StakingTopUpSteps.CONFIRM;

  const prepareConfirmSending = useCallback(async () => {
    console.log('todo');

    stepViewRef.current?.go(StakingTopUpSteps.CONFIRM);
  }, []);

  const sendTx = useCallback(async () => {
    await delay(3000);
  }, []);

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
        {t('staking.top_up')}
      </NavBar>
      <StepView
        ref={stepViewRef}
        backDisabled={isSending || isPreparing}
        onChangeStep={handleChangeStep}
        initialStepId={StakingTopUpSteps.AMOUNT}
        useBackHandler
      >
        <StepViewItem id={StakingTopUpSteps.AMOUNT}>
          {(stepProps) => (
            <AmountStep
              isPreparing={isPreparing}
              amount={amount}
              stepsScrollTop={stepsScrollTop}
              afterTopUpReward={afterTopUpReward}
              currentReward={currentReward}
              setAmount={setAmount}
              onContinue={prepareConfirmSending}
              {...stepProps}
            />
          )}
        </StepViewItem>
        <StepViewItem id={StakingTopUpSteps.CONFIRM}>
          {(stepProps) => (
            <ConfirmStep
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
