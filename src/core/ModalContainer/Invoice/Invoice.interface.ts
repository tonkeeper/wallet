import { CryptoCurrency } from '$shared/constants';

export interface InvoiceProps {
  currency: CryptoCurrency;
  amount: string;
  address: string;
}
