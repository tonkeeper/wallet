import { NFTOperations } from '$core/ModalContainer/NFTOperations/NFTOperations';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { SendAmount } from '$core/Send/Send.interface';
import { useFiatValue, useInstance, usePoolInfo, useTranslator, useWallet } from '$hooks';
import { Ton } from '$libs/Ton';
import { AppStackRouteNames } from '$navigation';
import { AppStackParamList } from '$navigation/AppStack';
import { StepView, StepViewItem, StepViewRef } from '$shared/components';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { getStakingPoolByAddress, Toast, useStakingStore } from '$store';
import { walletSelector } from '$store/wallet';
import { NavBar } from '$uikit';
import { calculateActionsTotalAmount, parseLocaleNumber } from '$utils';
import { getTimeSec } from '$utils/getTimeSec';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { AccountEvent } from '@tonkeeper/core';
import { shallow } from 'zustand/shallow';
import { AmountStep, ConfirmStep } from './steps';
import { StakingSendSteps, StakingTransactionType } from './types';
import { getStakeSignRawMessage, getWithdrawalAlertFee, getWithdrawalFee } from './utils';
import { formatter } from '$utils/formatter';
import {
  checkIsInsufficient,
  openInsufficientFundsModal,
} from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import { Alert } from 'react-native';
import { CanceledActionError } from '$core/Send/steps/ConfirmStep/ActionErrors';

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
      return t('staking.get_withdrawal');
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

  const isDeposit = transactionType === StakingTransactionType.DEPOSIT;
  const isWithdrawal = transactionType === StakingTransactionType.WITHDRAWAL;
  const isWithdrawalConfrim =
    transactionType === StakingTransactionType.WITHDRAWAL_CONFIRM;

  const unlockVault = useUnlockVault();

  const pool = useStakingStore((s) => getStakingPoolByAddress(s, poolAddress), shallow);
  const poolStakingInfo = useStakingStore((s) => s.stakingInfo[pool.address], shallow);

  const poolInfo = usePoolInfo(pool, poolStakingInfo);

  const currency =
    !isDeposit && poolInfo.stakingJetton
      ? (poolInfo.stakingJetton.jettonAddress as CryptoCurrencies)
      : CryptoCurrencies.Ton;

  const decimals = isDeposit ? Decimals[CryptoCurrencies.Ton] : poolInfo.balance.decimals;

  const isJetton = !isDeposit && !!poolInfo.stakingJetton;

  const symbol = isDeposit ? 'TON' : poolInfo.balance.symbol;

  const isWhalesPool = pool.implementation === 'whales';

  const { apy } = pool;

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

  const [amount, setAmount] = useState<SendAmount>({
    value: isWithdrawalConfrim
      ? formatter.format(isWhalesPool ? readyWithdraw : poolInfo.balance.amount, {
          decimals,
        })
      : '0',
    all: false,
  });

  const [isPreparing, setPreparing] = useState(false);
  const [isSending, setSending] = useState(false);

  const [accountEvent, setAccountEvent] = useState<AccountEvent | null>(null);

  const estimatedCurrentReward = useMemo(() => {
    const apyBN = new BigNumber(apy).dividedBy(100);
    const bigNum = new BigNumber(poolInfo.balance.totalTon).plus(
      new BigNumber(pendingDeposit),
    );

    return bigNum.multipliedBy(apyBN);
  }, [apy, pendingDeposit, poolInfo.balance.totalTon]);

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
        walletAddress,
        amount.all,
        poolInfo.stakingJetton,
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
  }, [
    amount.all,
    amount.value,
    operations,
    pool,
    poolInfo.stakingJetton,
    t,
    transactionType,
    walletAddress,
  ]);

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
    if (!actionRef.current || !accountEvent) {
      return Promise.reject();
    }

    const cancel = () => Promise.reject(new CanceledActionError());

    try {
      setSending(true);

      const totalAmount = calculateActionsTotalAmount(address.ton, accountEvent.actions);
      const checkResult = await checkIsInsufficient(totalAmount);
      if (checkResult.insufficient) {
        openInsufficientFundsModal({ totalAmount, balance: checkResult.balance });
        return cancel();
      }

      if (checkResult.balance !== null) {
        const withdrawalAlertFee = getWithdrawalAlertFee(pool);

        const isEnoughToWithdraw = new BigNumber(checkResult.balance)
          .minus(new BigNumber(totalAmount))
          .isGreaterThanOrEqualTo(Ton.toNano(1));

        if (!isEnoughToWithdraw && isDeposit) {
          const shouldContinue = await new Promise((res) =>
            Alert.alert(
              t('staking.withdrawal_fee_warning.title'),
              t('staking.withdrawal_fee_warning.message', {
                amount: formatter.format(Ton.fromNano(withdrawalAlertFee)),
              }),
              [
                {
                  text: t('staking.withdrawal_fee_warning.continue'),
                  onPress: () => res(true),
                  style: 'destructive',
                },
                {
                  text: t('cancel'),
                  onPress: () => res(false),
                  style: 'cancel',
                },
              ],
            ),
          );

          if (!shouldContinue) {
            return cancel();
          }
        }
      }

      const vault = await unlockVault();
      const privateKey = await vault.getTonPrivateKey();

      await actionRef.current.send(privateKey);
    } catch (e) {
      throw e;
    } finally {
      setSending(false);
    }
  }, [accountEvent, address.ton, isDeposit, pool, t, unlockVault]);

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
              currency={currency}
              isJetton={isJetton}
              stakingBalance={poolInfo.balance.amount}
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
              symbol={symbol}
              currency={currency}
              decimals={decimals}
              isJetton={isJetton}
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
