import { useInstance, useTokenPrice, useTranslator } from '$hooks';
import { useCurrencyToSend } from '$hooks/useCurrencyToSend';
import {
  CryptoCurrencies,
  CryptoCurrency,
  Decimals,
  getServerConfig,
} from '$shared/constants';
import { walletActions } from '$store/wallet';
import { NavBar, Text } from '$uikit';
import { isValidAddress, maskifyAddress, parseLocaleNumber } from '$utils';
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
import { SendAmount, SendProps, SendRecipient, SendSteps } from './Send.interface';
import { AddressStep } from './steps/AddressStep/AddressStep';
import { AmountStep } from './steps/AmountStep/AmountStep';
import { ConfirmStep } from './steps/ConfirmStep/ConfirmStep';
import { Keyboard } from 'react-native';
import { favoritesActions } from '$store/favorites';
import { Account, AccountsApi, Configuration } from '@tonkeeper/core/src/legacy';
import { DismissedActionError } from './steps/ConfirmStep/DismissedActionError';
import { formatter } from '$utils/formatter';
import { PagerView, Screen } from '@tonkeeper/uikit';
import { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import BigNumber from 'bignumber.js';

export const Send: FC<SendProps> = ({ route }) => {
  const {
    currency: initialCurrency,
    address: propsAddress,
    comment: initalComment = '',
    isJetton: initialIsJetton,
    amount: initialAmount = '0',
    fee: initialFee = '0',
    isInactive: initialIsInactive = false,
  } = route.params;
  const refPagerView = useRef<any>(null);

  const initialAddress =
    propsAddress && isValidAddress(propsAddress) ? propsAddress : null;

  const initialStepId = useMemo(() => {
    if (initialAmount !== '0' && initialFee !== '0') {
      return SendSteps.CONFIRM;
    }
  }, [initialAmount, initialFee]);

  const t = useTranslator();

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
  const [recipientAccountInfo, setRecipientAccountInfo] = useState<Account | null>(null);

  const [amount, setAmount] = useState<SendAmount>({
    value: formatter.format(initialAmount, {
      decimals: Decimals[CryptoCurrencies.Ton],
    }),
    all: false,
  });

  const [comment, setComment] = useState(initalComment.replace(/\0/g, ''));

  const [isPreparing, setPreparing] = useState(false);

  const [fee, setFee] = useState(initialFee);

  const [isInactive, setInactive] = useState(initialIsInactive);

  const { balance, currencyTitle, decimals, jettonWalletAddress } = useCurrencyToSend(
    currency,
    isJetton,
  );

  const tokenPrice = useTokenPrice(currency);

  const [currentStep, setCurrentStep] = useState<SendSteps>(SendSteps.ADDRESS);

  const handleBack = useCallback(
    () => refPagerView.current?.setPage(currentStep - 1),
    [currentStep],
  );

  const goToAmount = useCallback(() => {
    requestAnimationFrame(() => refPagerView.current?.setPage(SendSteps.AMOUNT));
  }, []);

  const goToConfirm = useCallback(() => {
    requestAnimationFrame(() => refPagerView.current?.setPage(SendSteps.CONFIRM));
  }, []);

  const isSwipingAllowed = useMemo(() => {
    if (currentStep === SendSteps.ADDRESS) {
      return !!recipient;
    } else if (currentStep === SendSteps.AMOUNT) {
      const bigNum = new BigNumber(parseLocaleNumber(amount.value));
      return !bigNum.isZero() && bigNum.isLessThanOrEqualTo(balance);
    } else {
      return true;
    }
  }, [amount.value, balance, currentStep, recipient]);

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
        onEnd: () => setPreparing(false),
        onNext: (details) => {
          setFee(details.fee);
          setInactive(details.isInactive);
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

  const handleChangeStep = useCallback(
    (e: PagerViewOnPageSelectedEvent) => {
      setCurrentStep(e.nativeEvent.position as SendSteps);
      if (e.nativeEvent.position === SendSteps.CONFIRM) {
        prepareConfirmSending();
      } else {
        setFee('0');
      }
    },
    [prepareConfirmSending],
  );

  const doSend = useCallback(
    (onDone: () => void, onFail: (e?: Error) => void) => {
      if (!recipient) {
        return onFail(new DismissedActionError());
      }

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
            onDone();
          },
          onFail: () => {
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

    try {
      const accountInfo = await accountsApi.getAccount({ accountId: recipient.address });

      setRecipientAccountInfo(accountInfo);
    } catch {}
  }, [accountsApi, recipient]);

  useEffect(() => () => Keyboard.dismiss(), []);

  useLayoutEffect(() => {
    fetchRecipientAccountInfo();
  }, [fetchRecipientAccountInfo]);

  const isAddressStep = currentStep === SendSteps.ADDRESS;
  const isConfirmStep = currentStep === SendSteps.CONFIRM;

  const hideBackButton = currentStep === 0;

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
    <Screen>
      <NavBar
        isModal
        isClosedButton
        isForceBackIcon
        hideBackButton={hideBackButton}
        hideTitle={isConfirmStep}
        subtitle={subtitle}
        onBackPress={handleBack}
      >
        {navBarTitle}
      </NavBar>
      <PagerView
        scrollEnabled={isSwipingAllowed}
        onPageSelected={handleChangeStep}
        initialPage={initialStepId}
        ref={refPagerView}
      >
        <PagerView.Page>
          <AddressStep
            active={currentStep === SendSteps.ADDRESS}
            recipient={recipient}
            decimals={decimals}
            setRecipient={setRecipient}
            setRecipientAccountInfo={setRecipientAccountInfo}
            recipientAccountInfo={recipientAccountInfo}
            comment={comment}
            setComment={setComment}
            setAmount={setAmount}
            onContinue={goToAmount}
          />
        </PagerView.Page>
        <PagerView.Page>
          <AmountStep
            active={currentStep === SendSteps.AMOUNT}
            recipient={recipient}
            decimals={decimals}
            balance={balance}
            currency={currency}
            onChangeCurrency={onChangeCurrency}
            currencyTitle={currencyTitle}
            amount={amount}
            fiatRate={tokenPrice.fiat}
            setAmount={setAmount}
            onContinue={goToConfirm}
          />
        </PagerView.Page>
        <PagerView.Page>
          <ConfirmStep
            isPreparing={isPreparing}
            active={currentStep === SendSteps.CONFIRM}
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
          />
        </PagerView.Page>
      </PagerView>
    </Screen>
  );
};
