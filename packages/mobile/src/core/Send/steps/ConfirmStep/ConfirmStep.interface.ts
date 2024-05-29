import {
  AccountWithPubKey,
  SendAmount,
  SendRecipient,
  TokenType,
} from '$core/Send/Send.interface';
import { CryptoCurrency } from '$shared/constants';
import { CustomFeeCurrency } from '$core/Send/new/core/useSendCore';

export interface ConfirmStepProps {
  active: boolean;
  currencyTitle: string;
  isBattery: boolean;
  isGasless?: boolean;
  isForcedGasless?: boolean;
  supportsGasless?: boolean;
  customFeeCurrency?: CustomFeeCurrency;
  currency: CryptoCurrency | string;
  recipient: SendRecipient | null;
  recipientAccountInfo: AccountWithPubKey | null;
  amount: SendAmount;
  decimals: number;
  tokenType: TokenType;
  feeCurrency?: string;
  fee: string;
  isInactive: boolean;
  comment: string;
  isCommentEncrypted: boolean;
  onConfirm: () => Promise<void>;
  isPreparing: boolean;
  redirectToActivity: boolean;
}
