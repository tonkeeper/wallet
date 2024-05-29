import { useCallback, useLayoutEffect, useState } from 'react';
import { AccountWithPubKey, SendAmount, SendRecipient } from '$core/Send/Send.interface';
import { formatter } from '$utils/formatter';
import { CryptoCurrencies, Decimals } from '$shared/constants';
import { Address } from '@tonkeeper/core';
import { tk } from '$wallet';

export interface InitialParams {
  comment: string;
  amount: string;
  address?: string;
}

export function useSendInputHandlers(initialParams: InitialParams) {
  const [comment, setComment] = useState(initialParams.comment.replace(/\0/g, ''));
  const [isCommentEncrypted, setCommentEncrypted] = useState(false);
  const [encryptedCommentPrivateKey, setEncryptedCommentPrivateKey] =
    useState<Uint8Array | null>(null);
  const [recipientAccountInfo, setRecipientAccountInfo] =
    useState<AccountWithPubKey | null>(null);

  const validatedInitialAddress =
    initialParams.address && Address.isValid(initialParams.address)
      ? initialParams.address
      : null;

  const [recipient, setRecipient] = useState<SendRecipient | null>(
    validatedInitialAddress
      ? { address: validatedInitialAddress, blockchain: 'ton' }
      : null,
  );

  const fetchRecipientAccountInfo = useCallback(async () => {
    if (!recipient) {
      setRecipientAccountInfo(null);
      return;
    }

    const accountId = recipient.address;

    try {
      const [accountInfoResponse, pubKeyResponse] = await Promise.allSettled([
        tk.wallet.tonapi.accounts.getAccount(accountId),
        tk.wallet.tonapi.accounts.getAccountPublicKey(accountId),
      ]);

      if (accountInfoResponse.status === 'rejected') {
        throw new Error(accountInfoResponse.reason);
      }

      if (!pubKeyResponse.value?.public_key || accountInfoResponse.value!.memo_required) {
        setCommentEncrypted(false);
      }

      setRecipientAccountInfo({
        publicKey: pubKeyResponse.value?.public_key,
        balance: accountInfoResponse.value!.balance,
        address: accountInfoResponse.value!.address,
        lastActivity: accountInfoResponse.value!.last_activity,
        getMethods: accountInfoResponse.value!.get_methods,
        status: accountInfoResponse.value!.status,
      });
    } catch {}
  }, [recipient]);

  useLayoutEffect(() => {
    fetchRecipientAccountInfo();
  }, [fetchRecipientAccountInfo]);

  const [amount, setAmount] = useState<SendAmount>({
    value: formatter.format(initialParams.amount, {
      decimals: Decimals[CryptoCurrencies.Ton],
    }),
    all: false,
  });

  return {
    comment,
    setComment,
    isCommentEncrypted,
    setCommentEncrypted,
    recipient,
    setRecipient,
    amount,
    setAmount,
    recipientAccountInfo,
    setRecipientAccountInfo,
    encryptedCommentPrivateKey,
    setEncryptedCommentPrivateKey,
  };
}
