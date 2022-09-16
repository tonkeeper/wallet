import { SendAmount, SendRecipient } from '../../Send.interface';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import { CryptoCurrency } from '$shared/constants';

export interface DoneStepProps extends StepComponentProps {
  currencyTitle: string;
  currency: CryptoCurrency | string;
  isJetton: boolean;
  amount: SendAmount;
  decimals: number;
  recipient: SendRecipient | null;
  fee: string;
}
