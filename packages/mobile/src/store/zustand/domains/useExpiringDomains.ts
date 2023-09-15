import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ExpiringDomains } from './types';
import { Tonapi } from '$libs/Tonapi';
import { useEffect } from 'react';
import { useWallet } from '../../../tabs/Wallet/hooks/useWallet';
import { Address } from '@tonkeeper/shared/Address';

const initialState: Omit<ExpiringDomains, 'actions'> = {
  domains: {},
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

          set({ domains });
        } catch (err) {
          console.log('err[getExpiringDNS]', err);
        }
      },
      remove: (address) => {
        set(({ domains }) => {
          const rawAddress = Address.parse(address).toRaw();
          const { [rawAddress]: remove, ...rest } = domains;
          return { domains: rest };
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
  }, []);

  return null;
}
