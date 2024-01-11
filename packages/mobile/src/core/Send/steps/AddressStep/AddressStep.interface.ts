import {
  SendRecipient,
  SendAmount,
  SendSteps,
  AccountWithPubKey,
} from '../../Send.interface';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import React from 'react';
import { SharedValue } from 'react-native-reanimated';
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
  setCommentEncrypted: React.Dispatch<React.SetStateAction<boolean>>;
  enableEncryption?: boolean;
  onContinue: () => void;
}
