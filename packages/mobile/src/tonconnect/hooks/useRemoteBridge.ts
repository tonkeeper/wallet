import { useAppState } from '$hooks/useAppState';
import { getAllConnections, useConnectedAppsStore } from '$store';
import { useEffect } from 'react';
import { TonConnectRemoteBridge } from '../TonConnectRemoteBridge';
import { useWallet } from '@tonkeeper/shared/hooks';
import { Address } from '@tonkeeper/core';

export const useRemoteBridge = () => {
  const wallet = useWallet();

  const address = Address.parse(wallet.address.ton.raw).toFriendly({
    bounceable: true,
    testOnly: wallet.isTestnet,
  });

  const appState = useAppState();

  useEffect(() => {
    if (appState !== 'active') {
      return;
    }

    const initialConnections = getAllConnections(
      useConnectedAppsStore.getState(),
      address,
    );

    TonConnectRemoteBridge.open(initialConnections, wallet.identifier);

    const unsubscribe = useConnectedAppsStore.subscribe(
      (s) => getAllConnections(s, address),
      (connections) => {
        TonConnectRemoteBridge.open(connections, address);
      },
    );

    return () => {
      unsubscribe();
      TonConnectRemoteBridge.close();
    };
  }, [address, appState]);
};
