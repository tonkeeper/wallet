import { useInstance } from '$hooks/useInstance';
import { useTokenPrice } from '$hooks/useTokenPrice';
import { useCurrencyToSend } from '$hooks/useCurrencyToSend';
import { StepView, StepViewItem, StepViewRef } from '$shared/components';
import { CryptoCurrencies, CryptoCurrency, Decimals } from '$shared/constants';
import { walletActions } from '$store/wallet';
import { NavBar, Text } from '$uikit';
import { delay, parseLocaleNumber } from '$utils';
import React, {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import {
  AccountWithPubKey,
  CurrencyAdditionalParams,
  SendAmount,
  SendProps,
  SendRecipient,
  SendSteps,
  TokenType,
} from './Send.interface';
import { AddressStep } from './steps/AddressStep/AddressStep';
import { AmountStep } from './steps/AmountStep/AmountStep';
import { ConfirmStep } from './steps/ConfirmStep/ConfirmStep';
import { Keyboard } from 'react-native';
import { favoritesActions } from '$store/favorites';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import {
  CanceledActionError,
  DismissedActionError,
} from './steps/ConfirmStep/ActionErrors';
import { AccountsApi, Configuration } from '@tonkeeper/core/src/legacy';
import { formatter } from '$utils/formatter';
import { Events } from '$store/models';
import { trackEvent } from '$utils/stats';
import { t } from '@tonkeeper/shared/i18n';
import { Address } from '@tonkeeper/core';
import { tk } from '$wallet';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { useValueRef } from '@tonkeeper/uikit';
import { RequestData } from '@tonkeeper/core/src/TronAPI/TronAPIGenerated';
import {
  InsufficientFundsParams,
  openInsufficientFundsModal,
} from '$core/ModalContainer/InsufficientFunds/InsufficientFunds';
import { getTimeSec } from '$utils/getTimeSec';
import { Toast } from '$store';
import { config } from '$config';
import { IndexerLatencyError } from '@tonkeeper/shared/utils/blockchain';
import { SignerError } from '$wallet/managers/SignerManager';

const tokensWithAllowedEncryption = [TokenType.TON, TokenType.Jetton];

export const Send: FC<SendProps> = ({ route }) => {
  const {
    currency: initialCurrency,
    address: propsAddress,
    comment: initalComment = '',
    tokenType: initialTokenType,
    currencyAdditionalParams: initialCurrencyAdditionalParams,
    amount: initialAmount = '0',
    fee: initialFee = '0',
    isInactive: initialIsInactive = false,
    from,
    expiryTimestamp,
    redirectToActivity = true,
    isBattery: initialIsBattery = false,
  } = route.params;

  const initialAddress =
    propsAddress && Address.isValid(propsAddress) ? propsAddress : null;

  const trcPayload = useValueRef<RequestData | null>(null);

  const initialStepId = useMemo(() => {
    if (initialAmount !== '0' && initialFee !== '0') {
      return SendSteps.CONFIRM;
    }
  }, [initialAmount, initialFee]);

  const dispatch = useDispatch();

  const accountsApi = useInstance(() => {
    const tonApiConfiguration = new Configuration({
      basePath: config.get('tonapiV2Endpoint', tk.wallet.isTestnet),
      headers: {
        Authorization: `Bearer ${config.get('tonApiV2Key', tk.wallet.isTestnet)}`,
      },
    });

    return new AccountsApi(tonApiConfiguration);
  });

  const [{ currency, tokenType, currencyAdditionalParams }, setCurrency] = useState({
    currency: initialCurrency || CryptoCurrencies.Ton,
    currencyAdditionalParams: initialCurrencyAdditionalParams,
    tokenType: initialTokenType || TokenType.TON,
  });

  const [recipient, setRecipient] = useState<SendRecipient | null>(
    initialAddress ? { address: initialAddress, blockchain: 'ton' } : null,
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

  const [encryptedCommentPrivateKey, setEncryptedCommentPrivateKey] =
    useState<Uint8Array | null>(null);
  const [isCommentEncrypted, setCommentEncrypted] = useState(false);

  const [isPreparing, setPreparing] = useState(false);
  const [isSending, setSending] = useState(false);

  const [fee, setFee] = useState(initialFee);

  const [isInactive, setInactive] = useState(initialIsInactive);
  const [isBattery, setBattery] = useState(initialIsBattery);

  const [insufficientFundsParams, setInsufficientFundsParams] =
    useState<InsufficientFundsParams | null>(null);

  const { balance, currencyTitle, decimals, jettonWalletAddress, trcToken } =
    useCurrencyToSend(currency, tokenType);

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
      nextTokenType: TokenType,
      nextCurrencyAdditionalParams?: CurrencyAdditionalParams,
    ) => {
      setAmount({
        value: '0',
        all: false,
      });
      setCurrency({
        currency: nextCurrency,
        tokenType: nextTokenType,
        currencyAdditionalParams: nextCurrencyAdditionalParams,
      });
      if (!tokensWithAllowedEncryption.includes(nextTokenType)) {
        setCommentEncrypted(false);
      }
    },
    [],
  );

  const changeBlockchain = useCallback((nextCurrency: CryptoCurrency | string) => {
    setAmount({
      value: '0',
      all: false,
    });
    setCurrency({
      currency: nextCurrency,
      tokenType: TokenType.USDT,
      currencyAdditionalParams: {},
    });
  }, []);

  const parsedAmount = useMemo(() => {
    const parsed = parseLocaleNumber(amount.value);

    if (!parsed) {
      return '0';
    }

    return parsed;
  }, [amount.value]);

  const prepareConfirmSending = useCallback(async () => {
    if (!recipient) {
      return;
    }

    setPreparing(true);

    if (recipient.blockchain === 'ton') {
      dispatch(
        walletActions.confirmSendCoins({
          currencyAdditionalParams: currencyAdditionalParams,
          currency: currency as CryptoCurrency,
          amount: parsedAmount,
          isSendAll: amount.all,
          address: recipient.address,
          tokenType,
          jettonWalletAddress,
          decimals,
          comment,
          isCommentEncrypted,
          onEnd: () => setPreparing(false),
          onInsufficientFunds: (params) => {
            setFee('0');
            setInsufficientFundsParams(params);

            stepViewRef.current?.go(SendSteps.CONFIRM);
          },
          onNext: (details) => {
            setInsufficientFundsParams(null);
            setFee(details.fee);
            setInactive(details.isInactive);
            setBattery(details.isBattery);

            stepViewRef.current?.go(SendSteps.CONFIRM);
          },
        }),
      );
    } else if (recipient.blockchain === 'tron') {
      stepViewRef.current?.go(SendSteps.CONFIRM);

      const payload = await tk.wallet.tronService.estimate({
        to: recipient.address,
        amount: amount.value,
        tokenAddress: trcToken!,
      });

      trcPayload.setValue(payload.request);

      setFee(formatter.fromNano(payload.request.fee, 6));
      setPreparing(false);
    }
  }, [
    recipient,
    dispatch,
    currencyAdditionalParams,
    currency,
    parsedAmount,
    amount.all,
    amount.value,
    tokenType,
    jettonWalletAddress,
    decimals,
    comment,
    isCommentEncrypted,
    trcToken,
    trcPayload,
  ]);

  const unlockVault = useUnlockVault();
  const doSend = useCallback(
    async (onDone: () => void, onFail: (e?: Error) => void) => {
      if (!recipient) {
        return onFail(new DismissedActionError());
      }

      const isCommentValid = tk.wallet.isLedger ? /^[ -~]*$/gm.test(comment) : true;

      if (!isCommentValid) {
        Toast.fail(t('send_screen_steps.comfirm.comment_ascii_text'));

        return onFail(new CanceledActionError());
      }

      const pendingTransactions = await tk.wallet.battery.getStatus();
      if (pendingTransactions.length) {
        Toast.fail(t('transfer_pending_by_battery_error'));
        await delay(200);
        return onFail(new CanceledActionError());
      }

      if (expiryTimestamp && expiryTimestamp < getTimeSec()) {
        Toast.fail(t('transfer_deeplink_expired_error'));

        return onFail(new CanceledActionError());
      }

      if (insufficientFundsParams) {
        goToAmount();
        openInsufficientFundsModal(insufficientFundsParams);

        return onFail(new CanceledActionError());
      }

      setSending(true);

      if (recipient.blockchain === 'ton') {
        dispatch(
          walletActions.sendCoins({
            fee,
            currencyAdditionalParams: currencyAdditionalParams,
            currency: currency as CryptoCurrency,
            amount: parsedAmount,
            isSendAll: amount.all,
            address: recipient.address,
            comment,
            isCommentEncrypted,
            encryptedCommentPrivateKey,
            tokenType,
            jettonWalletAddress,
            decimals,
            sendWithBattery: isBattery,
            onDone: () => {
              trackEvent(Events.SendSuccess, { from });
              dispatch(favoritesActions.restoreHiddenAddress(recipient.address));
              setSending(false);
              onDone();
            },
            onFail: (error) => {
              setSending(false);
              onFail(
                error instanceof IndexerLatencyError ||
                  error instanceof CanceledActionError ||
                  error instanceof SignerError
                  ? error
                  : new DismissedActionError(),
              );
            },
          }),
        );
      } else if (recipient.blockchain === 'tron' && trcPayload.value) {
        const unloked = await unlockVault();
        const privateKey = await unloked.getTonPrivateKey();
        const send = await tk.wallet.tronService.send(privateKey, trcPayload.value);
        console.log(send);

        setSending(false);
        onDone();
      } else if (recipient.blockchain === 'tron' && !trcPayload.value) {
        onFail(new Error('Error Tron Estimate'));
      }
    },
    [
      recipient,
      expiryTimestamp,
      insufficientFundsParams,
      trcPayload.value,
      goToAmount,
      dispatch,
      fee,
      currencyAdditionalParams,
      currency,
      parsedAmount,
      amount.all,
      comment,
      isCommentEncrypted,
      encryptedCommentPrivateKey,
      tokenType,
      jettonWalletAddress,
      decimals,
      isBattery,
      from,
      unlockVault,
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

  const handleSetCommentEncrypted = useCallback(
    async (value: boolean) => {
      try {
        if (value && !encryptedCommentPrivateKey) {
          const unlockedVault = await unlockVault(tk.wallet.identifier);

          const privateKey = await unlockedVault.getTonPrivateKey();

          setEncryptedCommentPrivateKey(privateKey);
        }

        setCommentEncrypted(value);
      } catch {}
    },
    [encryptedCommentPrivateKey, unlockVault],
  );

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
        initialStepId={initialStepId}
        onChangeStep={handleChangeStep}
        useBackHandler
        swipeBackEnabled={!isBackDisabled}
      >
        <StepViewItem id={SendSteps.ADDRESS}>
          {(stepProps) => (
            <AddressStep
              enableEncryption={
                tokensWithAllowedEncryption.includes(tokenType) && !tk.wallet.isExternal
              }
              recipient={recipient}
              decimals={decimals}
              changeBlockchain={changeBlockchain}
              setRecipient={setRecipient}
              setRecipientAccountInfo={setRecipientAccountInfo}
              recipientAccountInfo={recipientAccountInfo}
              comment={comment}
              isCommentEncrypted={isCommentEncrypted}
              setCommentEncrypted={handleSetCommentEncrypted}
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
              balance={String(balance)}
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
              isPreparing={isPreparing}
              isBattery={isBattery}
              currencyTitle={currencyTitle}
              currency={currency}
              recipient={recipient}
              recipientAccountInfo={recipientAccountInfo}
              amount={amount}
              decimals={decimals}
              tokenType={tokenType}
              fee={fee}
              isInactive={isInactive}
              comment={comment}
              isCommentEncrypted={isCommentEncrypted}
              onConfirm={handleSend}
              redirectToActivity={redirectToActivity}
              {...stepProps}
            />
          )}
        </StepViewItem>
      </StepView>
    </>
  );
};
