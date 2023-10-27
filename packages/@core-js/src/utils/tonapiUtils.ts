import { Account } from '../TonAPI';

export function isActiveAccount(status: Account['status']) {
  return !['empty', 'uninit', 'nonexist'].includes(status);
}
