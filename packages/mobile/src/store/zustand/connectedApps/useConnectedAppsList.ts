import { getChainName } from '$shared/dynamicConfig';
import { useCallback } from 'react';
import { IConnectedApp } from './types';
import { useConnectedAppsStore } from './useConnectedAppsStore';
import { useWallet } from '@tonkeeper/shared/hooks';
import { Address } from '@tonkeeper/shared/Address';

export const useConnectedAppsList = (): IConnectedApp[] => {
  const wallet = useWallet();

  const address = wallet
    ? Address.parse(wallet.address.ton.raw).toFriendly({
        bounceable: true,
        testOnly: wallet.isTestnet,
      })
    : '';

  return useConnectedAppsStore(
    useCallback(
      (s) => Object.values(s.connectedApps[getChainName()][address] ?? {}),
      [address],
    ),
  );
};
