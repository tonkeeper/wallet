import { useState } from 'react';
import {
  SendAmount,
  SendRecipient,
  SendSteps,
  TokenType,
} from '$core/Send/Send.interface';
import {
  estimateJettonTransferFee,
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

export interface SendCoreInitialParams {
  fee: string;
  isInactive: boolean;
  isBattery: boolean;
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
}

export const useSendCore = (
  params: SendCoreParams,
  initialParams: SendCoreInitialParams,
) => {
  const [fee, setFee] = useState(initialParams.fee);

  const [isPreparing, setPreparing] = useState(false);
  const [isSending, setSending] = useState(false);

  const [isInactive, setInactive] = useState(initialParams.isInactive);
  const [isBattery, setBattery] = useState(initialParams.isBattery);

  const estimateFee = async () => {
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

      let emulateResult: { fee: string; battery: boolean } | undefined;
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
          recipient: params.recipient.address,
          sendAmountNano: BigInt(toNano(parsedAmount, jetton?.metadata.decimals ?? 9)),
          jetton: jetton!,
          payload,
        });
      }

      if (!emulateResult) {
        throw new Error('Failed to estimate fee');
      }

      setFee(formatter.fromNano(emulateResult.fee));
      setBattery(emulateResult.battery);
      setPreparing(false);
    } catch (error) {
      Toast.fail(error.message);
      setFee('?');
      setBattery(false);
    } finally {
      params.goTo(SendSteps.CONFIRM);
      setPreparing(false);
    }
  };

  const sendBoc = async () => {
    setSending(true);
    const parsedAmount = parseLocaleNumber(params.amount.value);

    try {
      if (!params.recipient) {
        throw new Error('Recipient is required');
      }

      const recipientPubKey = (
        await tk.wallet.tonapi.accounts.getAccountPublicKey(params.recipient.address)
      ).public_key;

      let payload: Cell | undefined;
      if (params.isCommentEncrypted) {
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

      if (params.tokenType === TokenType.TON) {
        await sendTonBoc({
          recipient: params.recipient.address,
          sendAmountNano: BigInt(toNano(parsedAmount)),
          isSendAll: params.amount.all,
          shouldAttemptWithRelayer: false,
          payload,
        });
      } else if (params.tokenType === TokenType.Jetton) {
        const jetton = tk.wallet.jettons.state.data.jettonBalances.find((jetton) =>
          compareAddresses(params.currency, jetton.jettonAddress),
        );

        const totalAmount = new BigNumber(fee).isNegative()
          ? BASE_FORWARD_AMOUNT
          : BigInt(toNano(fee, 9)) + BASE_FORWARD_AMOUNT;

        await sendJettonBoc({
          recipient: params.recipient.address,
          shouldAttemptWithRelayer: isBattery,
          jettonTransferAmount: totalAmount,
          sendAmountNano: BigInt(toNano(parsedAmount, jetton?.metadata.decimals ?? 9)),
          jetton: jetton!,
          payload,
        });
      }
    } catch (error) {
      Toast.fail(error.message);
    } finally {
      setSending(false);
    }
  };

  return {
    fee,
    setFee,
    isInactive,
    setInactive,
    isBattery,
    setBattery,
    isPreparing,
    setPreparing,
    isSending,
    setSending,
    estimateFee,
    sendBoc,
  };
};
