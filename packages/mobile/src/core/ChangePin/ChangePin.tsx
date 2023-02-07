import React, { FC, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { NavBar } from '$uikit';
import { CreatePinForm } from '$shared/components';
import { UnlockedVault } from '$blockchain';
import { walletActions } from '$store/wallet';

export const ChangePin: FC = () => {
  const dispatch = useDispatch();
  const [vault, setVault] = useState<UnlockedVault | null>(null);

  const handleCreated = useCallback(
    (pin: string) => {
      dispatch(
        walletActions.changePin({
          pin,
          vault: vault!,
        }),
      );
    },
    [dispatch, vault],
  );

  const handleVaultUnlock = useCallback((unlockedVault) => {
    setVault(unlockedVault);
  }, []);

  return (
    <>
      <NavBar isCancelButton />
      <CreatePinForm
        validateOldPin
        onPinCreated={handleCreated}
        onVaultUnlocked={handleVaultUnlock}
      />
    </>
  );
};
