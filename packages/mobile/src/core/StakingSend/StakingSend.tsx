import { NFTOperations } from '$core/ModalContainer/NFTOperations/NFTOperations';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { SendAmount } from '$core/Send/Send.interface';
import { useFiatValue, useInstance, useTranslator, useWallet } from '$hooks';
import { Ton } from '$libs/Ton';
import { AppStackRouteNames } from '$navigation';
import { AppStackParamList } from '$navigation/AppStack';
import { StepView, StepViewItem, StepViewRef } from '$shared/components';
import { CryptoCurrencies } from '$shared/constants';
import { getStakingPoolByAddress, Toast, useStakingStore } from '$store';
import { walletSelector } from '$store/wallet';
import { NavBar } from '$uikit';
import { parseLocaleNumber } from '$utils';
import { getTimeSec } from '$utils/getTimeSec';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { AccountEvent } from 'tonapi-sdk-js';
import { shallow } from 'zustand/shallow';
import { AmountStep, ConfirmStep } from './steps';
import { StakingSendSteps, StakingTransactionType } from './types';
import { getStakeSignRawMessage, getWithdrawalFee } from './utils';

interface Props {
  route: RouteProp<AppStackParamList, AppStackRouteNames.StakingSend>;
}

const getTitle = (
  transactionType: StakingTransactionType,
  t: ReturnType<typeof useTranslator>,
) => {
  switch (transactionType) {
    case StakingTransactionType.WITHDRAWAL:
      return t('staking.withdrawal_request');
    case StakingTransactionType.WITHDRAWAL_CONFIRM:
      return t('staking.withdrawal_confrim');
    case StakingTransactionType.DEPOSIT:
    default:
      return t('staking.top_up');
  }
};

export const StakingSend: FC<Props> = (props) => {
  const {
    route: {
      params: { poolAddress, transactionType },
    },
  } = props;

  const isWithdrawal = transactionType === StakingTransactionType.WITHDRAWAL;
  const isWithdrawalConfrim =
    transactionType === StakingTransactionType.WITHDRAWAL_CONFIRM;

  const unlockVault = useUnlockVault();

  const pool = useStakingStore((s) => getStakingPoolByAddress(s, poolAddress), shallow);
  const poolStakingInfo = useStakingStore((s) => s.stakingInfo[pool.address], shallow);

  const { apy } = pool;

  const stakingBalance = Ton.fromNano(poolStakingInfo?.amount ?? '0');
  const pendingDeposit = Ton.fromNano(poolStakingInfo?.pendingDeposit ?? '0');
  const readyWithdraw = Ton.fromNano(poolStakingInfo?.readyWithdraw ?? '0');

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

  const { address } = useSelector(walletSelector);
  const walletAddress = address?.ton || '';
  const wallet = useWallet();
  const operations = useInstance(() => new NFTOperations(wallet));

  const [amount, setAmount] = useState<SendAmount>({ value: readyWithdraw, all: false });

  const [isPreparing, setPreparing] = useState(false);
  const [isSending, setSending] = useState(false);

  const [accountEvent, setAccountEvent] = useState<AccountEvent | null>(null);

  const estimatedCurrentReward = useMemo(() => {
    const apyBN = new BigNumber(apy).dividedBy(100);
    const bigNum = new BigNumber(stakingBalance).plus(new BigNumber(pendingDeposit));

    return bigNum.multipliedBy(apyBN);
  }, [apy, pendingDeposit, stakingBalance]);

  const estimatedTopUpReward = useMemo(() => {
    const apyBN = new BigNumber(apy).dividedBy(100);
    const bigNum = new BigNumber(parseLocaleNumber(amount.value || '0'));

    return bigNum.multipliedBy(apyBN).plus(estimatedCurrentReward);
  }, [amount.value, apy, estimatedCurrentReward]);

  const afterTopUpReward = useFiatValue(
    CryptoCurrencies.Ton,
    estimatedTopUpReward.toString(),
  );
  const currentReward = useFiatValue(
    CryptoCurrencies.Ton,
    estimatedCurrentReward.toString(),
  );

  const handleBack = useCallback(() => stepViewRef.current?.goBack(), []);

  const handleChangeStep = useCallback((id: string | number, index: number) => {
    setCurrentStep({ id: id as StakingSendSteps, index });
  }, []);

  const hideBackButton = currentStep.index === 0 || isWithdrawalConfrim;

  const hideTitle = currentStep.id === StakingSendSteps.CONFIRM;

  const actionRef = useRef<Awaited<ReturnType<typeof operations.signRaw>> | null>(null);

  const prepareConfirmSending = useCallback(async () => {
    try {
      setPreparing(true);

      const message = await getStakeSignRawMessage(
        pool,
        Ton.toNano(parseLocaleNumber(amount.value)),
        transactionType,
        amount.all,
      );

      const action = await operations.signRaw(
        {
          source: walletAddress,
          valid_until: getTimeSec() + 10 * 60,
          messages: [message],
        },
        transactionType === StakingTransactionType.DEPOSIT && amount.all ? 128 : 3,
      );

      actionRef.current = action;

      const data = await action.estimateTx();

      setAccountEvent(data);

      stepViewRef.current?.go(StakingSendSteps.CONFIRM);
    } catch (e) {
      Toast.fail(
        axios.isAxiosError(e) && e.message === 'Network Error'
          ? t('error_network')
          : t('error_occurred'),
      );

      console.log(e);
    } finally {
      setPreparing(false);
    }
  }, [amount, operations, pool, t, transactionType, walletAddress]);

  const totalFee = useMemo(() => {
    const fee = new BigNumber(Ton.fromNano(accountEvent?.fee.total.toString() ?? '0'));

    if (
      [
        [
          StakingTransactionType.WITHDRAWAL,
          StakingTransactionType.WITHDRAWAL_CONFIRM,
        ].includes(transactionType),
      ]
    ) {
      const withdrawalFee = new BigNumber(Ton.fromNano(getWithdrawalFee(pool)));

      return fee.plus(withdrawalFee).toString();
    }

    if (fee.isEqualTo(0)) {
      return undefined;
    }

    return fee.toString();
  }, [accountEvent, pool, transactionType]);

  const sendTx = useCallback(async () => {
    if (!actionRef.current) {
      return Promise.reject();
    }

    try {
      setSending(true);

      const vault = await unlockVault();
      const privateKey = await vault.getTonPrivateKey();

      await actionRef.current.send(privateKey);
    } catch (e) {
      throw e;
    } finally {
      setSending(false);
    }
  }, [unlockVault]);

  useEffect(() => {
    if (isWithdrawalConfrim) {
      prepareConfirmSending();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWithdrawalConfrim]);

  const title = getTitle(transactionType, t);

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
        backDisabled={isSending || isPreparing || isWithdrawalConfrim}
        onChangeStep={handleChangeStep}
        initialStepId={
          isWithdrawalConfrim ? StakingSendSteps.CONFIRM : StakingSendSteps.AMOUNT
        }
        useBackHandler
      >
        <StepViewItem id={StakingSendSteps.AMOUNT}>
          {(stepProps) => (
            <AmountStep
              pool={pool}
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
              transactionType={transactionType}
              pool={pool}
              totalFee={totalFee}
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
