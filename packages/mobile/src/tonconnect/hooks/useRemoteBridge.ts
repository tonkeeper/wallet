import { useAppState } from '$hooks/useAppState';
import { getAllConnections, useConnectedAppsStore } from '$store';
import { useEffect } from 'react';
import { TonConnectRemoteBridge } from '../TonConnectRemoteBridge';
import { useWallets } from '@tonkeeper/shared/hooks';

export const useRemoteBridge = () => {
  const wallets = useWallets();
  const walletIdentifiers = wallets.map((wallet) => wallet.identifier).join(',');

  const appState = useAppState();

  useEffect(() => {
    if (appState !== 'active') {
      return;
    }

    const initialConnections = getAllConnections(useConnectedAppsStore.getState());

    TonConnectRemoteBridge.open(initialConnections);

    const unsubscribe = useConnectedAppsStore.subscribe(
      (s) => getAllConnections(s),
      (connections) => {
        TonConnectRemoteBridge.open(connections);
      },
    );

    return () => {
      unsubscribe();
      TonConnectRemoteBridge.close();
    };
  }, [walletIdentifiers, appState]);
};
