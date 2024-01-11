import { Account } from '@tonkeeper/core/src/legacy';
import {
  AccountWithPubKey,
  SendAmount,
  SendRecipient,
  SendSteps,
  TokenType,
} from '$core/Send/Send.interface';
import { StepComponentProps } from '$shared/components/StepView/StepView.interface';
import { CryptoCurrency } from '$shared/constants';

export interface ConfirmStepProps {
  active: boolean;
  currencyTitle: string;
  isBattery: boolean;
  currency: CryptoCurrency | string;
  recipient: SendRecipient | null;
  recipientAccountInfo: AccountWithPubKey | null;
  amount: SendAmount;
  decimals: number;
  tokenType: TokenType;
  fee: string;
  isInactive: boolean;
  comment: string;
  isCommentEncrypted: boolean;
  onConfirm: () => Promise<void>;
  isPreparing: boolean;
  redirectToActivity: boolean;
}
