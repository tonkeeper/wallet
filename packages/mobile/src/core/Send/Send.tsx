import { useFiatRate, useInstance, useTranslator } from '$hooks';
import { useCurrencyToSend } from '$hooks/useCurrencyToSend';
import { StepView, StepViewItem, StepViewRef } from '$shared/components';
import { CryptoCurrencies, CryptoCurrency, getServerConfig } from '$shared/constants';
import {
  walletActions,
  walletBalancesSelector,
  walletWalletSelector,
} from '$store/wallet';
import { NavBar, Text } from '$uikit';
import { isValidAddress, maskifyAddress, parseLocaleNumber } from '$utils';
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
import { ConfirmStep } from './steps/ConfirmStep/ConfirmStep';
import BigNumber from 'bignumber.js';
import { Alert, Keyboard } from 'react-native';
import { favoritesActions } from '$store/favorites';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { AccountApi, AccountRepr, Configuration } from 'tonapi-sdk-js';
import { DismissedActionError } from './steps/ConfirmStep/DismissedActionError';

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
    id: SendSteps.ADDRESS,
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
      setAmount((s) => ({ value: s.value, all: false }));
      setCurrency(nextCurrency);
      setIsJetton(!!nextIsJetton);
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

  const doSend = useCallback(
    (onDone: () => void, onFail: (e?: Error) => void) => {
      if (!recipient) {
        return onFail(new DismissedActionError());
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
            setSending(false);
            onDone();
          },
          onFail: () => {
            setSending(false);
            onFail(new DismissedActionError());
          },
        }),
      );
    },
    [
      amount,
      comment,
      currency,
      decimals,
      dispatch,
      isJetton,
      jettonWalletAddress,
      recipient,
      withGoBack,
    ],
  );

  const handleSend = useCallback(() => {
    return new Promise<void>(async (resolve, reject) => {
      doSend(resolve, reject);
    });
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

  const isAddressStep = currentStep.id === SendSteps.ADDRESS;
  const isConfirmStep = currentStep.id === SendSteps.CONFIRM;

  const hideBackButton = currentStep.index === 0;

  const navBarTitle = isAddressStep
    ? t('send_screen_steps.address.title')
    : t('send_screen_steps.amount.title');

  const shortenedAddress = recipient ? maskifyAddress(recipient.address) : '';

  const name = recipient?.domain || recipient?.name || recipientAccountInfo?.name;

  const primaryName = name ?? shortenedAddress;

  const secondaryName = name ? shortenedAddress : '';

  const subtitle = isAddressStep ? null : (
    <Text variant="body2" color="textSecondary">
      {`${t('send_screen_steps.amount.recipient_label')} ${primaryName} `}
      {secondaryName.length ? (
        <Text variant="body2" color="textTertiary">
          {secondaryName}
        </Text>
      ) : (
        ''
      )}
    </Text>
  );

  return (
    <>
      <NavBar
        isModal
        isClosedButton
        isForceBackIcon
        hideBackButton={hideBackButton}
        hideTitle={isConfirmStep}
        scrollTop={scrollTop}
        subtitle={subtitle}
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
        swipeBackEnabled
      >
        <StepViewItem id={SendSteps.ADDRESS}>
          {(stepProps) => (
            <AddressStep
              recipient={recipient}
              decimals={decimals}
              stepsScrollTop={stepsScrollTop}
              setRecipient={setRecipient}
              setRecipientAccountInfo={setRecipientAccountInfo}
              recipientAccountInfo={recipientAccountInfo}
              comment={comment}
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
              decimals={decimals}
              balance={balance}
              currency={currency}
              onChangeCurrency={onChangeCurrency}
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
              fee={fee}
              isInactive={isInactive}
              comment={comment}
              onConfirm={handleSend}
              {...stepProps}
            />
          )}
        </StepViewItem>
      </StepView>
    </>
  );
};
