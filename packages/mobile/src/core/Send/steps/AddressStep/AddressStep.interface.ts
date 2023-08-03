import {
  SendRecipient,
  SendAmount,
  SendSteps,
  AccountWithPubKey,
} from '../../Send.interface';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import React from 'react';
import { SharedValue } from 'react-native-reanimated';

export interface AddressStepProps extends StepComponentProps {
  recipient: SendRecipient | null;
  decimals: number;
  stepsScrollTop: SharedValue<Record<SendSteps, number>>;
  comment: string;
  isCommentEncrypted: boolean;
  recipientAccountInfo: AccountWithPubKey | null;
  setRecipient: React.Dispatch<React.SetStateAction<SendRecipient | null>>;
  setRecipientAccountInfo: React.Dispatch<React.SetStateAction<AccountWithPubKey | null>>;
  setAmount: React.Dispatch<React.SetStateAction<SendAmount>>;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  setCommentEncrypted: React.Dispatch<React.SetStateAction<boolean>>;
  onContinue: () => void;
}
