import { SendAmount, SendRecipient, SendSteps } from '$core/Send/Send.interface';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import { CryptoCurrency } from '$shared/constants';
import React from 'react';
import { SharedValue } from 'react-native-reanimated';
import { AccountRepr } from 'tonapi-sdk-js';

export interface ConfirmStepProps extends StepComponentProps {
  stepsScrollTop: SharedValue<Record<SendSteps, number>>;
  currencyTitle: string;
  currency: CryptoCurrency | string;
  recipient: SendRecipient | null;
  recipientAccountInfo: AccountRepr | null;
  amount: SendAmount;
  decimals: number;
  isJetton: boolean;
  fee: string;
  isInactive: boolean;
  isSending: boolean;
  comment: string;
  setComment: React.Dispatch<React.SetStateAction<string>>;
  onConfirm: () => void;
}
