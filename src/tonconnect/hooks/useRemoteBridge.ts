import { useAppState } from '$hooks';
import { getAllConnections, useConnectedAppsStore, useRemoteBridgeStore } from '$store';
import { walletSelector } from '$store/wallet';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { TonConnectRemoteBridge } from '../TonConnectRemoteBridge';

export const useRemoteBridge = () => {
  const { address } = useSelector(walletSelector);

  const bridgeUrl = useRemoteBridgeStore((s) => s.bridgeUrl);

  const appState = useAppState();

  useEffect(() => {
    if (appState !== 'active') {
      return;
    }

    const initialConnections = getAllConnections(
      useConnectedAppsStore.getState(),
      address.ton,
    );

    TonConnectRemoteBridge.setBridge(bridgeUrl);

    TonConnectRemoteBridge.open(initialConnections);

    const unsubscribe = useConnectedAppsStore.subscribe(
      (s) => getAllConnections(s, address.ton),
      (connections) => {
        TonConnectRemoteBridge.open(connections);
      },
    );

    return () => {
      unsubscribe();
      TonConnectRemoteBridge.close();
    };
  }, [address.ton, appState, bridgeUrl]);
};
