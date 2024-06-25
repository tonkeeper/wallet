import { SendAmount, TokenType } from '$core/Send/Send.interface';
import { useFiatValue } from '$hooks/useFiatValue';
import { usePoolInfo } from '$hooks/usePoolInfo';
import { Ton } from '$libs/Ton';
import { AppStackRouteNames } from '$navigation';
import { AppStackParamList } from '$navigation/AppStack';
import { StepView, StepViewItem, StepViewRef } from '$shared/components';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { Toast, useNotificationsStore } from '$store';
import { getStakingPoolByAddress } from '@tonkeeper/shared/utils/staking';
import { NavBar } from '$uikit';
import { calculateMessageTransferAmount, delay, parseLocaleNumber } from '$utils';
import { RouteProp } from '@react-navigation/native';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
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
import { t } from '@tonkeeper/shared/i18n';
import { MessageConsequences, PoolImplementationType } from '@tonkeeper/core/src/TonAPI';
import { useCurrencyToSend } from '$hooks/useCurrencyToSend';
import { SignRawMessage } from '$core/ModalContainer/NFTOperations/TXRequest.types';
import { useStakingState, useWallet } from '@tonkeeper/shared/hooks';
import { tk } from '$wallet';
import { Address } from '@tonkeeper/shared/Address';
import { shallow } from 'zustand/shallow';
import { TransactionService } from '@tonkeeper/core';
import { getWalletSeqno } from '@tonkeeper/shared/utils/wallet';
import {
  getTimeoutFromLiteserverSafely,
  sendBoc,
} from '@tonkeeper/shared/utils/blockchain';

interface Props {
  route: RouteProp<AppStackParamList, AppStackRouteNames.StakingSend>;
}

const getTitle = (transactionType: StakingTransactionType) => {
  switch (transactionType) {
    case StakingTransactionType.WITHDRAWAL:
      return t('staking.withdrawal_request');
    case StakingTransactionType.WITHDRAWAL_CONFIRM:
      return t('staking.get_withdrawal');
    case StakingTransactionType.DEPOSIT:
    default:
      return t('staking.deposit');
  }
};

export const StakingSend: FC<Props> = (props) => {
  const {
    route: {
      params: { poolAddress, transactionType, amount: initialAmount },
    },
  } = props;

  const isDeposit = transactionType === StakingTransactionType.DEPOSIT;
  const isWithdrawal = transactionType === StakingTransactionType.WITHDRAWAL;
  const isWithdrawalConfrim =
    transactionType === StakingTransactionType.WITHDRAWAL_CONFIRM;

  const pool = useStakingState(
    (s) => getStakingPoolByAddress(s, poolAddress),
    [poolAddress],
  );
  const poolStakingInfo = useStakingState(
    (s) => s.stakingInfo[pool.address],
    [pool.address],
  );

  const poolInfo = usePoolInfo(pool, poolStakingInfo);

  const currency =
    !isDeposit && poolInfo.stakingJetton
      ? (poolInfo.stakingJetton.jettonAddress as CryptoCurrencies)
      : CryptoCurrencies.Ton;

  const decimals = Decimals[CryptoCurrencies.Ton];

  const tokenType =
    !isDeposit && !!poolInfo.stakingJetton ? TokenType.Jetton : TokenType.TON;

  const isWhalesPool = pool.implementation === PoolImplementationType.Whales;

  const { apy } = pool;

  const pendingDeposit = Ton.fromNano(poolStakingInfo?.pending_deposit ?? '0');
  const readyWithdraw = Ton.fromNano(poolStakingInfo?.ready_withdraw ?? '0');

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

  const wallet = useWallet();
  const walletAddress = wallet.address.ton.raw;

  const [amount, setAmount] = useState<SendAmount>({
    value: isWithdrawalConfrim
      ? formatter.format(isWhalesPool ? readyWithdraw : poolInfo.balance.amount, {
          decimals,
        })
      : initialAmount ?? '0',
    all: false,
  });

  const [isPreparing, setPreparing] = useState(false);
  const [isSending, setSending] = useState(false);

  const [consequences, setConsequences] = useState<MessageConsequences | null>(null);

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

  const messages = useRef<SignRawMessage[]>([]);

  const rawAddress = wallet.address.ton.raw ?? '';
  const stakingAddressToMigrateFrom = useNotificationsStore(
    (state) => state.wallets[rawAddress]?.stakingAddressToMigrateFrom,
    shallow,
  );
  const bypassUnstakeStep = useNotificationsStore(
    (state) => state.actions.bypassUnstakeStep,
  );

  const { isLiquidJetton, price } = useCurrencyToSend(currency, tokenType);

  const parsedAmount = useMemo(() => {
    const parsed = parseLocaleNumber(amount.value);

    if (!parsed) {
      return '0';
    }

    if (isLiquidJetton && price) {
      return amount.all
        ? price.amount
        : new BigNumber(parsed)
            .dividedBy(price.ton)
            .decimalPlaces(decimals, BigNumber.ROUND_DOWN)
            .toString();
    }

    return parsed;
  }, [amount.all, amount.value, decimals, isLiquidJetton, price]);

  const prepareConfirmSending = useCallback(async () => {
    try {
      setPreparing(true);

      const message = await getStakeSignRawMessage(
        pool,
        Ton.toNano(parsedAmount),
        transactionType,
        walletAddress,
        amount.all,
        poolInfo.stakingJetton,
      );

      messages.current = [message];

      const signer = await wallet.signer.getSigner(true);

      const timeout = await getTimeoutFromLiteserverSafely();

      const boc = await TransactionService.createTransfer(wallet.contract, signer, {
        timeout,
        messages: TransactionService.parseSignRawMessages(messages.current),
        seqno: await getWalletSeqno(wallet),
      });

      const response = await tk.wallet.tonapi.wallet.emulateMessageToWallet({ boc });

      setConsequences(response);

      await delay(100);

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
    parsedAmount,
    pool,
    poolInfo.stakingJetton,
    transactionType,
    wallet,
    walletAddress,
  ]);

  const totalFee = useMemo(() => {
    const fee = new BigNumber(Ton.fromNano(consequences?.event.extra ?? 0)).abs();

    if (fee.isEqualTo(0)) {
      return undefined;
    }

    if (
      [PoolImplementationType.Whales, PoolImplementationType.Tf].includes(
        pool.implementation,
      )
    ) {
      return fee.plus(Ton.fromNano(getWithdrawalFee(pool))).toString();
    }

    return fee.toString();
  }, [consequences?.event.extra, pool]);

  const sendTx = useCallback(async () => {
    if (!messages.current) {
      return Promise.reject();
    }
    try {
      setSending(true);

      const pendingTransactions = await tk.wallet.battery.getStatus();
      if (pendingTransactions.length) {
        Toast.fail(t('transfer_pending_by_battery_error'));
        await delay(200);
        throw new CanceledActionError();
      }

      const totalAmount = calculateMessageTransferAmount(messages.current);
      const checkResult = await checkIsInsufficient(totalAmount, tk.wallet);
      if (checkResult.insufficient) {
        const stakingFee = Ton.fromNano(getWithdrawalFee(pool));

        openInsufficientFundsModal({
          totalAmount,
          balance: checkResult.balance,
          stakingFee,
          fee: totalFee ?? '0.1',
        });

        await delay(200);
        throw new CanceledActionError();
      }

      if (checkResult.balance !== null) {
        const isEnoughToWithdraw = new BigNumber(checkResult.balance)
          .minus(new BigNumber(totalAmount))
          .isGreaterThanOrEqualTo(getWithdrawalAlertFee(pool));

        if (
          pool.implementation !== PoolImplementationType.LiquidTF &&
          !isEnoughToWithdraw &&
          isDeposit
        ) {
          const shouldContinue = await new Promise((res) =>
            Alert.alert(
              t('staking.withdrawal_fee_warning.title'),
              t('staking.withdrawal_fee_warning.message', {
                amount: formatter.format(Ton.fromNano(getWithdrawalAlertFee(pool, true))),
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
            await delay(200);
            throw new CanceledActionError();
          }
        }
      }

      const signer = await wallet.signer.getSigner();

      const timeout = await getTimeoutFromLiteserverSafely();

      const boc = await TransactionService.createTransfer(wallet.contract, signer, {
        timeout,
        messages: TransactionService.parseSignRawMessages(messages.current),
        seqno: await getWalletSeqno(wallet),
      });

      await sendBoc(boc, false);

      const endTimestamp = pool.cycle_end * 1000;
      const isCooldown = Date.now() > endTimestamp;

      if (
        (isWithdrawalConfrim || isCooldown) &&
        stakingAddressToMigrateFrom &&
        Address.compare(stakingAddressToMigrateFrom, pool.address)
      ) {
        bypassUnstakeStep(rawAddress);
      }
    } catch (e) {
      throw e;
    } finally {
      setSending(false);
    }
  }, [
    bypassUnstakeStep,
    isDeposit,
    isWithdrawalConfrim,
    pool,
    rawAddress,
    stakingAddressToMigrateFrom,
    totalFee,
    wallet,
  ]);

  useEffect(() => {
    if (isWithdrawalConfrim || initialAmount) {
      prepareConfirmSending();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWithdrawalConfrim, initialAmount]);

  const title = getTitle(transactionType);

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
          isWithdrawalConfrim || initialAmount
            ? StakingSendSteps.CONFIRM
            : StakingSendSteps.AMOUNT
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
              tokenType={tokenType}
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
              decimals={decimals}
              stepsScrollTop={stepsScrollTop}
              sendTx={sendTx}
              isPreparing={isPreparing}
              {...stepProps}
            />
          )}
        </StepViewItem>
      </StepView>
    </>
  );
};
