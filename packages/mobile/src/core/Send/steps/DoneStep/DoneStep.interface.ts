import { SendAmount, SendRecipient } from '../../Send.interface';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import { CryptoCurrency } from '$shared/constants';
import { Account } from '@tonkeeper/core';

export interface DoneStepProps extends StepComponentProps {
  currencyTitle: string;
  currency: CryptoCurrency | string;
  isJetton: boolean;
  amount: SendAmount;
  comment: string;
  decimals: number;
  recipient: SendRecipient | null;
  recipientAccountInfo: Account | null;
  fee: string;
}
