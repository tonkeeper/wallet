import { useAppState } from '$hooks';
import {
  DevFeature,
  getAllConnections,
  useConnectedAppsStore,
  useDevFeatureEnabled,
} from '$store';
import { walletSelector } from '$store/wallet';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { TonConnectRemoteBridge } from '../TonConnectRemoteBridge';

export const useRemoteBridge = () => {
  const isTonConnectV2Enabled = useDevFeatureEnabled(DevFeature.TonConnectV2);

  const { address } = useSelector(walletSelector);

  const appState = useAppState();

  useEffect(() => {
    if (!isTonConnectV2Enabled) {
      return;
    }

    if (appState !== 'active') {
      return;
    }

    const initialConnections = getAllConnections(
      useConnectedAppsStore.getState(),
      address.ton,
    );

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
  }, [address.ton, appState, isTonConnectV2Enabled]);
};
