import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CurrencyAdditionalParams,
  InscriptionAdditionalParams,
  SendAmount,
  SendRecipient,
  SendSteps,
  TokenType,
} from '$core/Send/Send.interface';
import {
  estimateJettonTransferFee,
  sendGaslessJettonBoc,
  sendJettonBoc,
} from '$core/Send/new/core/transactionBuilder/jetton';
import { tk } from '$wallet';
import { compareAddresses } from '$utils/address';
import { formatter } from '@tonkeeper/shared/formatter';
import { Cell, comment } from '@ton/core';
import nacl from 'tweetnacl';
import { BASE_FORWARD_AMOUNT, encryptMessageComment } from '@tonkeeper/core';
import {
  estimateTonTransferFee,
  sendTonBoc,
} from '$core/Send/new/core/transactionBuilder/ton';
import { Toast } from '@tonkeeper/uikit';
import { parseLocaleNumber, toNano } from '$utils';
import { Buffer } from 'buffer';
import BigNumber from 'bignumber.js';
import {
  estimateInscriptionTransferFee,
  sendInscriptionBoc,
} from '$core/Send/new/core/transactionBuilder/inscription';
import { t } from '@tonkeeper/shared/i18n';
import { CanceledActionError } from '$core/Send/steps/ConfirmStep/ActionErrors';
import { getRawTimeFromLiteserverSafely } from '@tonkeeper/shared/utils/blockchain';
import { JettonBalanceModel } from '$wallet/models/JettonBalanceModel';
import { useExternalState } from '@tonkeeper/shared/hooks/useExternalState';
import { BatterySupportedTransaction } from '$wallet/managers/BatteryManager';

export interface SendCoreInitialParams {
  fee: string;
  isBattery: boolean;
  isGasless?: boolean;
  isForcedGasless?: boolean;
  supportsGasless?: boolean;
  customFeeCurrency?: CustomFeeCurrency;
}

export interface SendCoreParams {
  goTo: (step: SendSteps) => void;
  currency: string;
  tokenType: TokenType;
  recipient: SendRecipient | null;
  comment: string;
  isCommentEncrypted: boolean;
  amount: SendAmount;
  encryptedCommentPrivateKey: Uint8Array | null;
  additionalParams?: CurrencyAdditionalParams;
  expiryTimestamp?: number | null;
}

export interface CustomFeeCurrency {
  decimals: number;
  symbol?: string;
  jetton_master: string;
}

export interface EmulateResult {
  customFeeCurrency?: CustomFeeCurrency;
  fee: string;
  battery: boolean;
  gasless?: boolean;
  supportsGasless?: boolean;
  feeJetton?: JettonBalanceModel;
  isForcedGasless?: boolean;
}

export const useSendCore = (
  params: SendCoreParams,
  initialParams: SendCoreInitialParams,
) => {
  const [customFeeCurrency, setCustomFeeCurrency] = useState<
    CustomFeeCurrency | undefined
  >(initialParams.customFeeCurrency);
  const [fee, setFee] = useState(initialParams.fee);

  const [isPreparing, setPreparing] = useState(false);
  const [isSending, setSending] = useState(false);

  const [relayerSendModes, setRelayerSendModes] = useState<{
    isBattery: boolean;
    isGasless: boolean;
    isForcedGasless?: boolean;
    supportsGasless?: boolean;
  }>({
    isBattery: initialParams.isBattery,
    isForcedGasless: initialParams.isForcedGasless,
    isGasless: initialParams.isGasless ?? false,
    supportsGasless: initialParams.supportsGasless,
  });

  const preferGasless = useExternalState(
    tk.wallet.battery.state,
    (state) => state.preferGasless,
  );

  const estimateFee = useCallback(async () => {
    setPreparing(true);
    const parsedAmount = parseLocaleNumber(params.amount.value);

    try {
      if (!params.recipient) {
        throw new Error('Recipient is required');
      }

      let payload: Cell | undefined;
      if (params.isCommentEncrypted) {
        const tempKeyPair = nacl.sign.keyPair();
        payload = await encryptMessageComment(
          params.comment,
          tempKeyPair.publicKey,
          tempKeyPair.publicKey,
          tempKeyPair.secretKey,
          tk.wallet.address.ton.raw,
        );
      } else if (params.comment) {
        payload = comment(params.comment);
      }

      let emulateResult: EmulateResult;
      if (params.tokenType === TokenType.TON) {
        emulateResult = await estimateTonTransferFee({
          recipient: params.recipient.address,
          sendAmountNano: BigInt(toNano(parsedAmount)),
          isSendAll: params.amount.all,
          payload,
        });
      } else if (params.tokenType === TokenType.Jetton) {
        const jetton = tk.wallet.jettons.state.data.jettonBalances.find((jetton) =>
          compareAddresses(params.currency, jetton.jettonAddress),
        );

        emulateResult = await estimateJettonTransferFee({
          shouldAttemptWithRelayer:
            tk.wallet.battery.state.data.supportedTransactions[
              BatterySupportedTransaction.Jetton
            ],
          preferGasless,
          recipient: params.recipient.address,
          sendAmountNano: BigInt(toNano(parsedAmount, jetton?.metadata.decimals ?? 9)),
          jetton: jetton!,
          payload,
        });
      } else if (params.tokenType === TokenType.Inscription) {
        const currencyAdditionalParams =
          params.additionalParams as InscriptionAdditionalParams;

        const inscription = tk.wallet.tonInscriptions.state.data.items.find(
          (item) =>
            item.ticker === params.currency &&
            item.type === currencyAdditionalParams.type,
        )!;

        emulateResult = await estimateInscriptionTransferFee({
          recipient: params.recipient.address,
          sendAmountNano: BigInt(toNano(parsedAmount, inscription.decimals)),
          inscription,
          payload,
        });
      }

      if (!emulateResult) {
        throw new Error('Failed to estimate fee');
      }

      setCustomFeeCurrency(emulateResult.customFeeCurrency);
      setFee(
        formatter.fromNano(
          emulateResult.fee,
          emulateResult.gasless ? emulateResult.customFeeCurrency!.decimals : 9,
        ),
      );
      setRelayerSendModes({
        isBattery: emulateResult.battery,
        isGasless: emulateResult.gasless ?? false,
        supportsGasless: emulateResult.supportsGasless ?? false,
        isForcedGasless: emulateResult.isForcedGasless ?? false,
      });
      setPreparing(false);
      params.goTo(SendSteps.CONFIRM);
    } catch (error) {
      if (error.message) {
        Toast.fail(error.message);
      }
      setFee('');
      setRelayerSendModes({ isBattery: false, isGasless: false, supportsGasless: false });
    } finally {
      setPreparing(false);
    }
  }, [params, preferGasless]);

  const sendBoc = useCallback(
    async (onDone: () => void, onFail: (e?: Error) => void) => {
      setSending(true);
      const parsedAmount = parseLocaleNumber(params.amount.value);

      try {
        if (!params.recipient) {
          throw new Error('Recipient is required');
        }

        if (
          params.expiryTimestamp &&
          params.expiryTimestamp < (await getRawTimeFromLiteserverSafely())
        ) {
          setSending(false);
          Toast.fail(t('transfer_deeplink_expired_error'));

          return onFail(new CanceledActionError());
        }

        let payload: Cell | undefined;
        if (params.isCommentEncrypted) {
          const recipientPubKey = (
            await tk.wallet.tonapi.accounts.getAccountPublicKey(params.recipient.address)
          ).public_key;

          payload = await encryptMessageComment(
            params.comment,
            Buffer.from(tk.wallet.pubkey, 'hex'),
            Buffer.from(recipientPubKey, 'hex'),
            params.encryptedCommentPrivateKey!,
            tk.wallet.address.ton.raw,
          );
        } else if (params.comment) {
          payload = comment(params.comment);
        }

        switch (params.tokenType) {
          case TokenType.TON:
            return await sendTonBoc({
              recipient: params.recipient.address,
              sendAmountNano: BigInt(toNano(parsedAmount)),
              isSendAll: params.amount.all,
              shouldAttemptWithRelayer: false,
              payload,
            });
          case TokenType.Jetton:
            const jetton = tk.wallet.jettons.state.data.jettonBalances.find((jetton) =>
              compareAddresses(params.currency, jetton.jettonAddress),
            );

            const totalAmount =
              relayerSendModes.isGasless || new BigNumber(fee).isNegative()
                ? BASE_FORWARD_AMOUNT
                : BigInt(toNano(fee, 9)) + BASE_FORWARD_AMOUNT;

            const jettonSendParams = {
              commission: BigInt(toNano(fee, jetton?.metadata.decimals ?? 9)),
              recipient: params.recipient.address,
              shouldAttemptWithRelayer: relayerSendModes.isBattery,
              jettonTransferAmount: totalAmount,
              sendAmountNano: BigInt(
                toNano(parsedAmount, jetton?.metadata.decimals ?? 9),
              ),
              jetton: jetton!,
              payload,
            };

            if (relayerSendModes.isGasless) {
              return await sendGaslessJettonBoc(jettonSendParams);
            }
            return await sendJettonBoc(jettonSendParams);
          case TokenType.Inscription:
            const currencyAdditionalParams =
              params.additionalParams as InscriptionAdditionalParams;

            const inscription = tk.wallet.tonInscriptions.state.data.items.find(
              (item) =>
                item.ticker === params.currency &&
                item.type === currencyAdditionalParams.type,
            )!;

            await sendInscriptionBoc({
              recipient: params.recipient.address,
              sendAmountNano: BigInt(toNano(parsedAmount, inscription.decimals)),
              inscription,
              payload,
            });
        }
      } catch (error) {
        onFail(error);
      } finally {
        setSending(false);
        onDone();
      }
    },
    [
      fee,
      params.additionalParams,
      params.amount.all,
      params.amount.value,
      params.comment,
      params.currency,
      params.encryptedCommentPrivateKey,
      params.expiryTimestamp,
      params.isCommentEncrypted,
      params.recipient,
      params.tokenType,
      relayerSendModes.isBattery,
      relayerSendModes.isGasless,
    ],
  );

  const isFirstRenderSkipped = useRef(false);
  useEffect(() => {
    if (isFirstRenderSkipped.current) {
      estimateFee();
    }
    isFirstRenderSkipped.current = true;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferGasless]);

  return {
    customFeeCurrency,
    fee,
    setFee,
    relayerSendModes,
    isPreparing,
    setPreparing,
    isSending,
    setSending,
    estimateFee,
    sendBoc,
  };
};
