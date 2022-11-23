import { getChainName } from '$shared/dynamicConfig';
import { walletSelector } from '$store/wallet';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { IConnectedApp } from './types';
import { useConnectedAppsStore } from './useConnectedAppsStore';

export const useConnectedAppsList = (): IConnectedApp[] => {
  const { address } = useSelector(walletSelector);

  return useConnectedAppsStore(
    useCallback(
      (s) => Object.values(s.connectedApps[getChainName()][address.ton] ?? {}),
      [address.ton],
    ),
  );
};
