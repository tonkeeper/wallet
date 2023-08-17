import { useInstance } from '$hooks/useInstance';
import { useTokenPrice } from '$hooks/useTokenPrice';
import { useCurrencyToSend } from '$hooks/useCurrencyToSend';
import { StepView, StepViewItem, StepViewRef } from '$shared/components';
import {
  CryptoCurrencies,
  CryptoCurrency,
  Decimals,
  getServerConfig,
} from '$shared/constants';
import { walletActions } from '$store/wallet';
import { NavBar, Text } from '$uikit';
import { parseLocaleNumber } from '$utils';
import React, {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  AccountWithPubKey,
  SendAmount,
  SendProps,
  SendRecipient,
  SendSteps,
} from './Send.interface';
import { AddressStep } from './steps/AddressStep/AddressStep';
import { AmountStep } from './steps/AmountStep/AmountStep';
import { ConfirmStep } from './steps/ConfirmStep/ConfirmStep';
import { Keyboard } from 'react-native';
import { favoritesActions } from '$store/favorites';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { DismissedActionError } from './steps/ConfirmStep/ActionErrors';
import { Configuration, AccountsApi } from '@tonkeeper/core/src/legacy';
import { formatter } from '$utils/formatter';
import { Events } from '$store/models';
import { trackEvent } from '$utils/stats';
import { t } from '@tonkeeper/shared/i18n';
import { Address } from '@tonkeeper/core';

export const Send: FC<SendProps> = ({ route }) => {
  const {
    currency: initialCurrency,
    address: propsAddress,
    comment: initalComment = '',
    isJetton: initialIsJetton,
    amount: initialAmount = '0',
    fee: initialFee = '0',
    isInactive: initialIsInactive = false,
    from,
  } = route.params;

  const initialAddress =
    propsAddress && Address.isValid(propsAddress) ? propsAddress : null;

  const initialStepId = useMemo(() => {
    if (initialAmount !== '0' && initialFee !== '0') {
      return SendSteps.CONFIRM;
    }
  }, [initialAmount, initialFee]);

  const dispatch = useDispatch();

  const accountsApi = useInstance(() => {
    const tonApiConfiguration = new Configuration({
      basePath: getServerConfig('tonapiV2Endpoint'),
      headers: {
        Authorization: `Bearer ${getServerConfig('tonApiV2Key')}`,
      },
    });

    return new AccountsApi(tonApiConfiguration);
  });

  const [{ currency, isJetton }, setCurrency] = useState({
    currency: initialCurrency || CryptoCurrencies.Ton,
    isJetton: !!initialIsJetton,
  });

  const [recipient, setRecipient] = useState<SendRecipient | null>(
    initialAddress ? { address: initialAddress } : null,
  );
  const [recipientAccountInfo, setRecipientAccountInfo] =
    useState<AccountWithPubKey | null>(null);

  const [amount, setAmount] = useState<SendAmount>({
    value: formatter.format(initialAmount, {
      decimals: Decimals[CryptoCurrencies.Ton],
    }),
    all: false,
  });

  const [comment, setComment] = useState(initalComment.replace(/\0/g, ''));

  const [isCommentEncrypted, setCommentEncrypted] = useState(false);

  const [isPreparing, setPreparing] = useState(false);
  const [isSending, setSending] = useState(false);

  const [fee, setFee] = useState(initialFee);

  const [isInactive, setInactive] = useState(initialIsInactive);

  const { balance, currencyTitle, decimals, jettonWalletAddress } = useCurrencyToSend(
    currency,
    isJetton,
  );

  const tokenPrice = useTokenPrice(currency);

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

  const onChangeCurrency = useCallback(
    (
      nextCurrency: CryptoCurrency | string,
      nextDecimals: number,
      nextIsJetton: boolean,
    ) => {
      setAmount({
        value: '0',
        all: false,
      });
      setCurrency({ currency: nextCurrency, isJetton: !!nextIsJetton });
    },
    [],
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
        comment,
        isCommentEncrypted,
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
    comment,
    currency,
    decimals,
    dispatch,
    isCommentEncrypted,
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
          isCommentEncrypted,
          isJetton,
          jettonWalletAddress,
          decimals,
          onDone: () => {
            trackEvent(Events.SendSuccess, { from });
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
      amount.all,
      amount.value,
      comment,
      currency,
      decimals,
      dispatch,
      from,
      isCommentEncrypted,
      isJetton,
      jettonWalletAddress,
      recipient,
    ],
  );

  const handleSend = useCallback(() => {
    return new Promise<void>(async (resolve, reject) => {
      doSend(resolve, reject);
    });
  }, [doSend]);

  const fetchRecipientAccountInfo = useCallback(async () => {
    if (!recipient) {
      setRecipientAccountInfo(null);
      return;
    }

    const accountId = recipient.address;

    try {
      const [accountInfoResponse, pubKeyResponse] = await Promise.allSettled([
        accountsApi.getAccount({ accountId }),
        accountsApi.getPublicKeyByAccountID({ accountId }),
      ]);

      if (accountInfoResponse.status === 'rejected') {
        throw new Error(accountInfoResponse.reason);
      }

      const accountInfo: AccountWithPubKey = { ...accountInfoResponse.value };

      if (pubKeyResponse.status === 'fulfilled') {
        accountInfo.publicKey = pubKeyResponse.value.publicKey;
      }

      if (!accountInfo.publicKey || accountInfo.memoRequired) {
        setCommentEncrypted(false);
      }

      setRecipientAccountInfo(accountInfo);
    } catch {}
  }, [accountsApi, recipient]);

  useEffect(() => () => Keyboard.dismiss(), []);

  useLayoutEffect(() => {
    fetchRecipientAccountInfo();
  }, [fetchRecipientAccountInfo]);

  const isAddressStep = currentStep.id === SendSteps.ADDRESS;
  const isConfirmStep = currentStep.id === SendSteps.CONFIRM;

  const hideBackButton = currentStep.index === 0 || initialStepId === SendSteps.CONFIRM;

  const isBackDisabled = isSending || isPreparing || initialStepId === SendSteps.CONFIRM;

  const navBarTitle = isAddressStep
    ? t('send_screen_steps.address.title')
    : t('send_screen_steps.amount.title');

  const shortenedAddress = recipient ? Address.toShort(recipient.address) : '';

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
        backDisabled={isBackDisabled}
        onChangeStep={handleChangeStep}
        initialStepId={initialStepId}
        useBackHandler
        swipeBackEnabled={!isBackDisabled}
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
              isCommentEncrypted={isCommentEncrypted}
              setCommentEncrypted={setCommentEncrypted}
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
              fiatRate={tokenPrice.fiat}
              setAmount={setAmount}
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
              isCommentEncrypted={isCommentEncrypted}
              onConfirm={handleSend}
              {...stepProps}
            />
          )}
        </StepViewItem>
      </StepView>
    </>
  );
};
