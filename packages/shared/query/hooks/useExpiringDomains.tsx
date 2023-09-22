import { useExternalState } from '../../hooks/useExternalState';
import { NftAddress } from '@tonkeeper/core';
import { tk } from '../../tonkeeper';

export function useExpiringDomains() {
  const state = useExternalState(
    tk.wallet?.expiringDomains.state ?? { getSnapshot: () => null },
  );

  return {
    domains: state.domains,
    reload: () => {
      tk.wallet?.expiringDomains.load();
    },
    remove: (domainAddress: NftAddress) => {
      tk.wallet?.expiringDomains.remove(domainAddress);
    },
  };
}
