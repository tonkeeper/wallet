import { tk, tonapi } from '../tonkeeper';

export async function getWalletSeqno() {
  try {
    const seqno = (await tonapi.wallet.getAccountSeqno(tk.wallet.address.ton.raw)).seqno;
    return seqno;
  } catch (e) {
    return 0;
  }
}
