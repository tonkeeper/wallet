import { SendRecipient, SendAmount } from '../../Send.interface';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import React from 'react';

export interface AmountStepProps extends StepComponentProps {
  isPreparing: boolean;
  recipient: SendRecipient | null;
  decimals: number;
  balance: string;
  currencyTitle: string;
  amount: SendAmount;
  fiatRate: number;
  setAmount: React.Dispatch<React.SetStateAction<SendAmount>>;
  goToAddress: () => void;
  onContinue: () => void;
}
