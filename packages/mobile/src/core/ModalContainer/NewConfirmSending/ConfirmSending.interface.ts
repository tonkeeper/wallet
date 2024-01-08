import { CryptoCurrency } from '$shared/constants';
import { TokenType } from '$core/Send/Send.interface';

export interface ConfirmSendingProps {
  currency: CryptoCurrency;
  amount: string;
  address: string;
  comment: string;
  fee: string;
  withGoBack?: boolean;
  isInactive: boolean;
  tokenType: TokenType;
  domain?: string;
  methodId?: string;
}
