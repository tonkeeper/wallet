import { CryptoCurrency } from '$shared/constants';

export interface ConfirmSendingProps {
  currency: CryptoCurrency;
  amount: string;
  address: string;
  comment: string;
  fee: string;
  withGoBack?: boolean;
  isInactive: boolean;
  isJetton: boolean;
  domain?: string;
}
