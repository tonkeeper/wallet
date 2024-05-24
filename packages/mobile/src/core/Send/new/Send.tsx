import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import {
  CurrencyAdditionalParams,
  SendProps,
  SendSteps,
  TokenType,
} from '$core/Send/Send.interface';
import { NavBar, Text } from '$uikit';
import { StepView, StepViewItem, StepViewRef } from '$shared/components';
import { AddressStep } from '$core/Send/steps/AddressStep/AddressStep';
import { tk } from '$wallet';
import { AmountStep } from '$core/Send/steps/AmountStep/AmountStep';
import { ConfirmStep } from '$core/Send/steps/ConfirmStep/ConfirmStep';
import { CryptoCurrencies, CryptoCurrency } from '$shared/constants';
import {
  getTokenTypeFeatures,
  SendFeature,
  useTokenTypeFeatures,
} from '$core/Send/new/hooks/useTokenTypeFeatures';
import { useSendNavigation } from '$core/Send/new/hooks/useSendNavigation';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { useSendInputHandlers } from '$core/Send/new/hooks/useSendInputHandlers';
import { useSendCore } from '$core/Send/new/core/useSendCore';
import { useCurrencyToSend } from '$core/Send/new/hooks/useCurrencyToSend';
import { useTokenPrice } from '$hooks/useTokenPrice';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { t } from '@tonkeeper/shared/i18n';
import { Address } from '@tonkeeper/core';

export const SendNew: FC<SendProps> = ({ route }) => {
  const stepViewRef = useRef<StepViewRef>(null);

  const {
    currency: initialCurrency,
    address: initialAddress,
    comment: initalComment = '',
    tokenType: initialTokenType,
    currencyAdditionalParams: initialCurrencyAdditionalParams,
    amount: initialAmount = '0',
    fee: initialFee = '0',
    from,
    expiryTimestamp,
    redirectToActivity = true,
    isBattery: initialIsBattery = false,
  } = route.params;

  const initialStepId = useMemo(() => {
    if (initialAmount !== '0' && initialFee !== '0') {
      return SendSteps.CONFIRM;
    }
  }, [initialAmount, initialFee]);

  const inputHandlers = useSendInputHandlers({
    comment: initalComment,
    amount: initialAmount,
    address: initialAddress,
  });

  const goBack = useCallback(() => stepViewRef.current?.goBack(), []);
  const goTo = (step: SendSteps) => () => stepViewRef.current?.go(step);
  const sendNavigation = useSendNavigation(initialStepId);

  const [{ currency, tokenType, currencyAdditionalParams }, setCurrency] = useState({
    currency: initialCurrency || CryptoCurrencies.Ton,
    currencyAdditionalParams: initialCurrencyAdditionalParams,
    tokenType: initialTokenType || TokenType.TON,
  });
  const tokenTypeFeatures = useTokenTypeFeatures(tokenType);

  const sendCore = useSendCore(
    {
      goTo: (step: SendSteps) => stepViewRef.current?.go(step),
      expiryTimestamp,
      recipient: inputHandlers.recipient,
      tokenType,
      currency,
      isCommentEncrypted: inputHandlers.isCommentEncrypted,
      comment: inputHandlers.comment,
      amount: inputHandlers.amount,
      encryptedCommentPrivateKey: inputHandlers.encryptedCommentPrivateKey,
      additionalParams: currencyAdditionalParams,
    },
    {
      isBattery: initialIsBattery,
      fee: initialFee,
    },
  );

  const onChangeCurrency = useCallback(
    (
      nextCurrency: CryptoCurrency | string,
      nextDecimals: number,
      nextTokenType: TokenType,
      nextCurrencyAdditionalParams?: CurrencyAdditionalParams,
    ) => {
      inputHandlers.setAmount({
        value: '0',
        all: false,
      });
      setCurrency({
        currency: nextCurrency,
        tokenType: nextTokenType,
        currencyAdditionalParams: nextCurrencyAdditionalParams,
      });
      if (!getTokenTypeFeatures(nextTokenType).includes(SendFeature.CommentEncryption)) {
        inputHandlers.setCommentEncrypted(false);
      }
    },
    [inputHandlers],
  );

  const tokenPrice = useTokenPrice(currency);

  const { balance, currencyTitle, decimals } = useCurrencyToSend(currency, tokenType);

  const stepsScrollTop = useSharedValue(
    Object.keys(SendSteps).reduce(
      (acc, cur) => ({ ...acc, [cur]: 0 }),
      {} as Record<SendSteps, number>,
    ),
  );

  const unlockVault = useUnlockVault();
  const handleSetCommentEncrypted = useCallback(
    async (value: boolean) => {
      try {
        if (value && !inputHandlers.encryptedCommentPrivateKey) {
          const unlockedVault = await unlockVault(tk.wallet.identifier);

          const privateKey = await unlockedVault.getTonPrivateKey();

          inputHandlers.setEncryptedCommentPrivateKey(privateKey);
        }

        inputHandlers.setCommentEncrypted(value);
      } catch {}
    },
    [inputHandlers, unlockVault],
  );

  const scrollTop = useDerivedValue<number>(
    () => stepsScrollTop.value[sendNavigation.currentStep.id] || 0,
  );
  const isBackDisabled =
    sendCore.isSending || sendCore.isPreparing || initialStepId === SendSteps.CONFIRM;

  const name =
    inputHandlers.recipient?.domain ||
    inputHandlers.recipient?.name ||
    inputHandlers.recipientAccountInfo?.name;

  const shortenedAddress = inputHandlers.recipient
    ? Address.toShort(inputHandlers.recipient.address)
    : '';

  const primaryName = name ?? shortenedAddress;
  const secondaryName = name ? shortenedAddress : '';
  const subtitle = sendNavigation.isStep(SendSteps.ADDRESS) ? null : (
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

  const handleSendBoc = useCallback(() => {
    return new Promise<void>(async (resolve, reject) => {
      sendCore.sendBoc(resolve, reject);
    });
  }, [sendCore]);

  return (
    <>
      <NavBar
        isModal
        isClosedButton
        isForceBackIcon
        hideBackButton={sendNavigation.hideBackButton}
        hideTitle={sendNavigation.isStep(SendSteps.CONFIRM)}
        scrollTop={scrollTop}
        subtitle={subtitle}
        onBackPress={goBack}
      >
        {sendNavigation.navBarTitle}
      </NavBar>
      <StepView
        ref={stepViewRef}
        backDisabled={isBackDisabled}
        initialStepId={initialStepId}
        onChangeStep={sendNavigation.handleChangeStep}
        useBackHandler
        swipeBackEnabled={!isBackDisabled}
      >
        <StepViewItem id={SendSteps.ADDRESS}>
          {(stepProps) => (
            <AddressStep
              enableEncryption={tokenTypeFeatures.includes(SendFeature.CommentEncryption)}
              recipient={inputHandlers.recipient}
              decimals={decimals}
              changeBlockchain={() => null}
              setRecipient={inputHandlers.setRecipient}
              setRecipientAccountInfo={inputHandlers.setRecipientAccountInfo}
              recipientAccountInfo={inputHandlers.recipientAccountInfo}
              comment={inputHandlers.comment}
              isCommentEncrypted={inputHandlers.isCommentEncrypted}
              setCommentEncrypted={handleSetCommentEncrypted}
              setComment={inputHandlers.setComment}
              setAmount={inputHandlers.setAmount}
              onContinue={goTo(SendSteps.AMOUNT)}
              {...stepProps}
            />
          )}
        </StepViewItem>

        <StepViewItem id={SendSteps.AMOUNT}>
          {(stepProps) => (
            <AmountStep
              isPreparing={sendCore.isPreparing}
              recipient={inputHandlers.recipient}
              decimals={decimals}
              balance={String(balance)}
              currency={currency}
              onChangeCurrency={onChangeCurrency}
              currencyTitle={currencyTitle}
              amount={inputHandlers.amount}
              fiatRate={tokenPrice.fiat}
              setAmount={inputHandlers.setAmount}
              onContinue={sendCore.estimateFee}
              {...stepProps}
            />
          )}
        </StepViewItem>

        <StepViewItem id={SendSteps.CONFIRM}>
          {(stepProps) => (
            <ConfirmStep
              isPreparing={sendCore.isPreparing}
              isBattery={sendCore.relayerSendModes.isBattery}
              isGasless={sendCore.relayerSendModes.isGasless}
              isForcedGasless={sendCore.relayerSendModes.isForcedGasless}
              supportsGasless={sendCore.relayerSendModes.supportsGasless}
              customFeeCurrency={sendCore.customFeeCurrency}
              currencyTitle={currencyTitle}
              currency={currency}
              recipient={inputHandlers.recipient}
              recipientAccountInfo={inputHandlers.recipientAccountInfo}
              amount={inputHandlers.amount}
              decimals={decimals}
              tokenType={tokenType}
              fee={sendCore.fee}
              isInactive={false}
              comment={inputHandlers.comment}
              isCommentEncrypted={inputHandlers.isCommentEncrypted}
              onConfirm={handleSendBoc}
              redirectToActivity={redirectToActivity}
              {...stepProps}
            />
          )}
        </StepViewItem>
      </StepView>
    </>
  );
};
