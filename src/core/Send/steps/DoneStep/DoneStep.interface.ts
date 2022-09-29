import { SendAmount, SendRecipient } from '../../Send.interface';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import { CryptoCurrency } from '$shared/constants';
import { AccountRepr } from 'tonapi-sdk-js';

export interface DoneStepProps extends StepComponentProps {
  currencyTitle: string;
  currency: CryptoCurrency | string;
  isJetton: boolean;
  amount: SendAmount;
  comment: string;
  decimals: number;
  recipient: SendRecipient | null;
  recipientAccountInfo: AccountRepr | null;
  fee: string;
}
