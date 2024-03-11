import { tk } from '@tonkeeper/mobile/src/wallet';
import { Wallet } from '@tonkeeper/mobile/src/wallet/Wallet';

export async function getWalletSeqno(wallet?: Wallet) {
  try {
    const seqno = (
      await (wallet ?? tk.wallet).tonapi.wallet.getAccountSeqno(
        (wallet ?? tk.wallet).address.ton.raw,
      )
    ).seqno;
    return seqno;
  } catch (e) {
    return 0;
  }
}

export function setBalanceForEmulation(balance: bigint | number | string) {
  return { balance: Number(balance), address: tk.wallet.address.ton.raw };
}
