import React from 'react';
import { useDispatch } from 'react-redux';
import { walletActions } from '$store/wallet';
import { UnlockedVault } from 'blockchain/vault';

export const useUnlockVault = () => {
  const dispatch = useDispatch();

  const unlockVault = React.useCallback(
    async (walletIdentifier?: string) => {
      return new Promise<UnlockedVault>((resolve, reject) => {
        dispatch(
          walletActions.walletGetUnlockedVault({
            onDone: (vault) => resolve(vault),
            onFail: (err) => reject(err),
            walletIdentifier,
          }),
        );
      });
    },
    [dispatch],
  );

  return unlockVault;
};
