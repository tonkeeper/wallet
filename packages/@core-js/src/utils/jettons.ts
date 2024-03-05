import { JettonBalance } from '../TonAPI';
import BigNumber from 'bignumber.js';
import { AmountFormatter } from './AmountFormatter';

export function sortByPrice(a: JettonBalance, b: JettonBalance) {
  if (!a.price?.prices) {
    return !b.price?.prices ? 0 : 1;
  }

  if (!b.price?.prices) {
    return -1;
  }

  const aTotal = BigNumber(a.price?.prices!.TON).multipliedBy(
    AmountFormatter.fromNanoStatic(a.balance, a.jetton.decimals),
  );
  const bTotal = BigNumber(b.price?.prices!.TON).multipliedBy(
    AmountFormatter.fromNanoStatic(b.balance, b.jetton.decimals),
  );
  if (bTotal.gt(aTotal)) {
    return 1;
  } else if (aTotal.gt(bTotal)) {
    return -1;
  } else {
    return 0;
  }
}
