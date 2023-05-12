import { SendRecipient, SendAmount } from '../../Send.interface';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import React from 'react';
import { AccountRepr } from 'tonapi-sdk-js';

export interface AmountStepProps extends StepComponentProps {
  isPreparing: boolean;
  recipient: SendRecipient | null;
  decimals: number;
  balance: string;
  currency: string;
  currencyTitle: string;
  amount: SendAmount;
  fiatRate: number;
  onChangeCurrency: (currency: string, isJetton?: boolean) => void;
  setAmount: React.Dispatch<React.SetStateAction<SendAmount>>;
  goToAddress: () => void;
  onContinue: () => void;
}
