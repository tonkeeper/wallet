import { SendRecipient, SendAmount } from '../../Send.interface';
import React from 'react';
import { Account } from '@tonkeeper/core';

export interface AddressStepProps {
  recipient: SendRecipient | null;
  decimals: number;
  comment: string;
  active: boolean;
  recipientAccountInfo: Account | null;
  setRecipient: React.Dispatch<React.SetStateAction<SendRecipient | null>>;
  setRecipientAccountInfo: React.Dispatch<React.SetStateAction<Account | null>>;
  setAmount: React.Dispatch<React.SetStateAction<SendAmount>>;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  onContinue: () => void;
}
