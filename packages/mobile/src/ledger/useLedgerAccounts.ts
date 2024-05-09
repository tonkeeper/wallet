import { getLedgerAccountPathByIndex } from '$utils/ledger';
import { TonTransport } from '@ton-community/ton-ledger';
import { Address } from '@ton/core';
import { useCallback } from 'react';

export const useLedgerAccounts = (
  tonTransport: TonTransport | null,
  deviceId: string | null,
) => {
  const getAccounts = useCallback(async () => {
    if (!tonTransport) {
      throw new Error('No transport');
    }

    if (!deviceId) {
      throw new Error('No device id');
    }

    const run = Array.from({ length: 10 }).map((_, i) => i);
    const res: { address: string; pubkey: string; index: number }[] = [];

    for (const index of run) {
      const path = getLedgerAccountPathByIndex(index);
      const addr = await tonTransport.getAddress(path);

      res.push({
        address: Address.parse(addr.address).toRawString(),
        pubkey: addr.publicKey.toString('hex'),
        index,
      });
    }

    return res;
  }, [deviceId, tonTransport]);

  return getAccounts;
};
