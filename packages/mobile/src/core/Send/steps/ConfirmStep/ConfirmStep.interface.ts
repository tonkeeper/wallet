import { SendAmount, SendRecipient, SendSteps } from '$core/Send/Send.interface';
import { CryptoCurrency } from '$shared/constants';
import { Account } from '@tonkeeper/core/src/legacy';

export interface ConfirmStepProps {
  active: boolean;
  currencyTitle: string;
  currency: CryptoCurrency | string;
  recipient: SendRecipient | null;
  recipientAccountInfo: Account | null;
  amount: SendAmount;
  decimals: number;
  isJetton: boolean;
  fee: string;
  isInactive: boolean;
  comment: string;
  onConfirm: () => Promise<void>;
}
