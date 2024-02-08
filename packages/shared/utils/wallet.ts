import { tk } from '@tonkeeper/mobile/src/wallet';

export async function getWalletSeqno() {
  try {
    const seqno = (
      await tk.wallet.tonapi.wallet.getAccountSeqno(tk.wallet.address.ton.raw)
    ).seqno;
    return seqno;
  } catch (e) {
    return 0;
  }
}

export function setBalanceForEmulation(balance: bigint) {
  return { balance: Number(balance), address: tk.wallet.address.ton.raw };
}
