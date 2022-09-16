import { TransactionModel } from '$store/models';
import BigNumber from 'bignumber.js';
import { CryptoCurrencies } from '$shared/constants';

export function parseBtcTransactions(
  address: string,
  item: any,
  provider: string,
): TransactionModel {
  let isSending = false;
  let resAddress = '';
  let totalAmount = new BigNumber(0);

  for (let row of item.vin) {
    if (row.prevout.scriptpubkey_address === address) {
      isSending = true;
    } else {
      resAddress = row.prevout.scriptpubkey_address;
    }
  }

  for (let row of item.vout) {
    if (isSending) {
      if (row.scriptpubkey_address !== address) {
        totalAmount = totalAmount.plus(row.value);
        resAddress = row.scriptpubkey_address;
      }
    } else {
      if (row.scriptpubkey_address === address) {
        totalAmount = totalAmount.plus(row.value);
      }
    }
  }

  return {
    internalId: `${CryptoCurrencies.Btc}_${item.txid}`,
    currency: CryptoCurrencies.Btc,
    timestamp: +item.status.block_time,
    hash: item.txid,
    fee: new BigNumber(item.fee).div(1e8).toString(),
    type: !isSending ? 'receive' : 'sent',
    address: resAddress,
    amount: totalAmount.div(1e8).toString(),
    confirmations: 4, // blockstream не возвращает количество подтверждений
    provider,
  };
}
