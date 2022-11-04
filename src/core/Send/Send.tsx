import { useFiatRate, useInstance, useTranslator } from '$hooks';
import { useCurrencyToSend } from '$hooks/useCurrencyToSend';
import { StepView, StepViewItem, StepViewRef } from '$shared/components';
import { CryptoCurrencies, CryptoCurrency, getServerConfig } from '$shared/constants';
import {walletActions, walletBalancesSelector, walletSelector, walletWalletSelector} from '$store/wallet';
import { NavBar } from '$uikit';
import { isValidAddress, parseLocaleNumber } from '$utils';
import React, {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SendAmount, SendProps, SendRecipient, SendSteps } from './Send.interface';
import { AddressStep } from './steps/AddressStep/AddressStep';
import { AmountStep } from './steps/AmountStep/AmountStep';
import { ChooseCoinStep } from './steps/ChooseCoinStep/ChooseCoinStep';
import { ConfirmStep } from './steps/ConfirmStep/ConfirmStep';
import BigNumber from 'bignumber.js';
import { Alert, Keyboard } from 'react-native';
import { DoneStep } from './steps/DoneStep/DoneStep';
import { goBack, openReminderEnableNotificationsModal } from '$navigation';
import { favoritesActions } from '$store/favorites';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { AccountApi, AccountRepr, Configuration } from 'tonapi-sdk-js';

export const Send: FC<SendProps> = ({ route }) => {
  const {
    currency: initialCurrency,
    address: propsAddress,
    comment: initalComment = '',
    isJetton: initialIsJetton,
    amount: initialAmount = '0',
    fee: initialFee = '0',
    isInactive: initialIsInactive = false,
    withGoBack,
  } = route.params;

  const initialAddress =
    propsAddress && isValidAddress(propsAddress) ? propsAddress : null;

  const initialStepId = useMemo(() => {
    if (initialAmount !== '0' && initialFee !== '0') {
      return SendSteps.CONFIRM;
    }
    if (initialAddress) {
      return SendSteps.AMOUNT;
    }
  }, [initialAmount, initialFee, initialAddress]);

  const t = useTranslator();

  const dispatch = useDispatch();

  const accountApi = useInstance(() => {
    const tonApiConfiguration = new Configuration({
      basePath: getServerConfig('tonapiIOEndpoint'),
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiKey')}`,
      },
    });

    return new AccountApi(tonApiConfiguration);
  });

  const balances = useSelector(walletBalancesSelector);
  const wallet = useSelector(walletWalletSelector);

  const [currency, setCurrency] = useState(initialCurrency || CryptoCurrencies.Ton);
  const [isJetton, setIsJetton] = useState(!!initialIsJetton);

  const [recipient, setRecipient] = useState<SendRecipient | null>(
    initialAddress ? { address: initialAddress } : null,
  );
  const [recipientAccountInfo, setRecipientAccountInfo] = useState<AccountRepr | null>(
    null,
  );

  const [amount, setAmount] = useState<SendAmount>({ value: initialAmount, all: false });

  const [comment, setComment] = useState(initalComment.replace(/\0/g, ''));

  const [isPreparing, setPreparing] = useState(false);
  const [isSending, setSending] = useState(false);

  const [fee, setFee] = useState(initialFee);

  const [isInactive, setInactive] = useState(initialIsInactive);

  const { balance, currencyTitle, decimals, jettonWalletAddress } = useCurrencyToSend(
    currency,
    isJetton,
  );

  const fiatRate = useFiatRate(currency as CryptoCurrency);

  const stepViewRef = useRef<StepViewRef>(null);

  const [currentStep, setCurrentStep] = useState<{ id: SendSteps; index: number }>({
    id: initialCurrency ? SendSteps.ADDRESS : SendSteps.CHOOSE_TOKEN,
    index: 0,
  });

  const stepsScrollTop = useSharedValue(
    Object.keys(SendSteps).reduce(
      (acc, cur) => ({ ...acc, [cur]: 0 }),
      {} as Record<SendSteps, number>,
    ),
  );

  const scrollTop = useDerivedValue<number>(
    () => stepsScrollTop.value[currentStep.id] || 0,
  );

  const navBarTitle = currency ? t('send_title', { currency: currencyTitle }) : '';

  const handleBack = useCallback(() => stepViewRef.current?.goBack(), []);

  const handleChangeStep = useCallback((id: string | number, index: number) => {
    setCurrentStep({ id: id as SendSteps, index });
  }, []);

  const goToAmount = useCallback(() => {
    stepViewRef.current?.go(SendSteps.AMOUNT);
  }, []);

  const goToAddress = useCallback(() => {
    stepViewRef.current?.go(SendSteps.ADDRESS);
  }, []);

  const onChangeCurrency = useCallback(
    (nextCurrency: CryptoCurrency | string, nextIsJetton?: boolean) => {
      setAmount({ value: '0', all: false });
      setRecipient(null);
      setCurrency(nextCurrency);
      setIsJetton(!!nextIsJetton);

      goToAddress();
    },
    [goToAddress],
  );

  const prepareConfirmSending = useCallback(async () => {
    if (!recipient) {
      return;
    }

    setPreparing(true);

    dispatch(
      walletActions.confirmSendCoins({
        currency: currency as CryptoCurrency,
        amount: parseLocaleNumber(amount.value),
        address: recipient.address,
        isJetton,
        jettonWalletAddress,
        decimals,
        onEnd: () => setPreparing(false),
        onNext: (details) => {
          setFee(details.fee);
          setInactive(details.isInactive);

          stepViewRef.current?.go(SendSteps.CONFIRM);
        },
      }),
    );
  }, [
    amount.value,
    currency,
    decimals,
    dispatch,
    isJetton,
    jettonWalletAddress,
    recipient,
  ]);

  const doSend = useCallback(() => {
    if (!recipient) {
      return;
    }

    setSending(true);
    dispatch(
      walletActions.sendCoins({
        currency: currency as CryptoCurrency,
        amount: parseLocaleNumber(amount.value),
        isSendAll: amount.all,
        address: recipient.address,
        comment,
        isJetton,
        jettonWalletAddress,
        decimals,
        onDone: () => {
          dispatch(favoritesActions.restoreHiddenAddress(recipient.address));

          if (withGoBack) {
            goBack();
            setTimeout(() => {
              openReminderEnableNotificationsModal();
            }, 350);
            return;
          }

          setSending(false);
          stepViewRef.current?.go(SendSteps.DONE);
        },
        onFail: () => setSending(false),
      }),
    );
  }, [
    amount,
    comment,
    currency,
    decimals,
    dispatch,
    isJetton,
    jettonWalletAddress,
    recipient,
    withGoBack,
  ]);

  const handleSend = useCallback(() => {
    const amountWithFee = new BigNumber(parseLocaleNumber(amount.value)).plus(fee);
    if (
      currency === CryptoCurrencies.Ton &&
      wallet &&
      wallet.ton.isLockup() &&
      !amount.all &&
      new BigNumber(balances[currency]).isLessThan(amountWithFee)
    ) {
      Alert.alert(t('send_lockup_warning_title'), t('send_lockup_warning_caption'), [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('send_lockup_warning_submit_button'),
          onPress: () => doSend(),
          style: 'destructive',
        },
      ]);
    } else {
      doSend();
    }
  }, [amount, fee, currency, wallet, balances, t, doSend]);

  const fetchRecipientAccountInfo = useCallback(async () => {
    if (!recipient) {
      setRecipientAccountInfo(null);
      return;
    }

    try {
      const accountInfo = await accountApi.getAccountInfo({ account: recipient.address });

      setRecipientAccountInfo(accountInfo);
    } catch {}
  }, [accountApi, recipient]);

  useEffect(() => () => Keyboard.dismiss(), []);

  useLayoutEffect(() => {
    fetchRecipientAccountInfo();
  }, [fetchRecipientAccountInfo]);

  const isDoneStep = currentStep.id === SendSteps.DONE;

  const hideBackButton = currentStep.index === 0 || isDoneStep;

  const hideTitle = currentStep.id === SendSteps.CHOOSE_TOKEN || isDoneStep;

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
        {navBarTitle}
      </NavBar>
      <StepView
        ref={stepViewRef}
        backDisabled={isSending || isPreparing}
        onChangeStep={handleChangeStep}
        initialStepId={initialStepId}
        useBackHandler
      >
        {!initialCurrency ? (
          <StepViewItem id={SendSteps.CHOOSE_TOKEN}>
            {(stepProps) => (
              <ChooseCoinStep
                stepsScrollTop={stepsScrollTop}
                onChangeCurrency={onChangeCurrency}
                {...stepProps}
              />
            )}
          </StepViewItem>
        ) : null}

        <StepViewItem id={SendSteps.ADDRESS}>
          {(stepProps) => (
            <AddressStep
              recipient={recipient}
              decimals={decimals}
              stepsScrollTop={stepsScrollTop}
              setRecipient={setRecipient}
              setRecipientAccountInfo={setRecipientAccountInfo}
              setComment={setComment}
              setAmount={setAmount}
              onContinue={goToAmount}
              {...stepProps}
            />
          )}
        </StepViewItem>

        <StepViewItem id={SendSteps.AMOUNT}>
          {(stepProps) => (
            <AmountStep
              isPreparing={isPreparing}
              recipient={recipient}
              recipientAccountInfo={recipientAccountInfo}
              decimals={decimals}
              balance={balance}
              currencyTitle={currencyTitle}
              amount={amount}
              fiatRate={fiatRate.today}
              setAmount={setAmount}
              goToAddress={goToAddress}
              onContinue={prepareConfirmSending}
              {...stepProps}
            />
          )}
        </StepViewItem>

        <StepViewItem id={SendSteps.CONFIRM}>
          {(stepProps) => (
            <ConfirmStep
              stepsScrollTop={stepsScrollTop}
              currencyTitle={currencyTitle}
              currency={currency}
              recipient={recipient}
              recipientAccountInfo={recipientAccountInfo}
              amount={amount}
              decimals={decimals}
              isJetton={isJetton}
              isSending={isSending}
              fee={fee}
              isInactive={isInactive}
              comment={comment}
              setComment={setComment}
              onConfirm={handleSend}
              {...stepProps}
            />
          )}
        </StepViewItem>

        <StepViewItem id={SendSteps.DONE}>
          {(stepProps) => (
            <DoneStep
              currencyTitle={currencyTitle}
              currency={currency}
              amount={amount}
              comment={comment}
              decimals={decimals}
              isJetton={isJetton}
              recipient={recipient}
              recipientAccountInfo={recipientAccountInfo}
              fee={fee}
              {...stepProps}
            />
          )}
        </StepViewItem>
      </StepView>
    </>
  );
};
