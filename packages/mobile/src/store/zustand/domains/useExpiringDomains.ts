import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ExpiringDomains } from './types';
import { Tonapi } from '$libs/Tonapi';
import { useEffect } from 'react';
import { useWallet } from '../../../tabs/Wallet/hooks/useWallet';
import { Address } from '$libs/Ton';

const initialState: Omit<ExpiringDomains, 'actions'> = {
  domains: {},
  items: [],
};

export const useExpiringDomains = create(
  subscribeWithSelector<ExpiringDomains>((set) => ({
    ...initialState,
    actions: {
      load: async (account_id) => {
        try {
          const { data } = await Tonapi.getExpiringDNS({
            account_id,
            period: 30,
          });

          const domains = {};
          for (let item of data.items) {
            domains[item.dns_item.address] = item.expiring_at;
          }

          set({ domains, items: data.items });
        } catch (err) {
          console.log('[getExpiringDNS]', err);
        }
      },
      remove: (address) => {
        set(({ domains, items }) => {
          const rawAddress = new Address(address).format({ raw: true });
          const { [rawAddress]: remove, ...rest } = domains;
          const newItems = items.filter((item) => item.dns_item.address !== rawAddress);

          return { domains: rest, items: newItems };
        });
      },
    },
  })),
);

export function useLoadExpiringDomains() {
  const wallet = useWallet();
  const load = useExpiringDomains(
    (state) => state.actions.load,
    () => true,
  );

  useEffect(() => {
    if (wallet) {
      load(wallet.address.rawAddress);
    }
  }, [wallet?.address.rawAddress]);

  return null;
}
