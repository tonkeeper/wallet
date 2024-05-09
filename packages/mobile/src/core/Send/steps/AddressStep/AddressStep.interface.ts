import { SendRecipient, SendAmount, AccountWithPubKey } from '../../Send.interface';
import React from 'react';
import { CryptoCurrencies } from '$shared/constants';

export interface AddressStepProps {
  recipient: SendRecipient | null;
  decimals: number;
  comment: string;
  isCommentEncrypted: boolean;
  recipientAccountInfo: AccountWithPubKey | null;
  setRecipient: React.Dispatch<React.SetStateAction<SendRecipient | null>>;
  changeBlockchain?: (currency: CryptoCurrencies) => void;
  setRecipientAccountInfo: React.Dispatch<React.SetStateAction<AccountWithPubKey | null>>;
  setAmount?: React.Dispatch<React.SetStateAction<SendAmount>>;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  setCommentEncrypted: (value: boolean) => void;
  enableEncryption?: boolean;
  onContinue: () => void;
}
