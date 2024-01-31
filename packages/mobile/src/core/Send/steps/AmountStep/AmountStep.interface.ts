import { SendRecipient, SendAmount, TokenType } from '../../Send.interface';
import React from 'react';

export interface AmountStepProps {
  recipient: SendRecipient | null;
  decimals: number;
  balance: string;
  currency: string;
  active: boolean;
  currencyTitle: string;
  amount: SendAmount;
  fiatRate: number;
  isPreparing: boolean;
  onChangeCurrency: (currency: string, decimals: number, tokenType: TokenType) => void;
  setAmount: React.Dispatch<React.SetStateAction<SendAmount>>;
  onContinue: () => void;
}
