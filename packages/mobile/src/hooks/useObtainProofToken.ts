import { useCallback } from 'react';
import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { tk } from '$wallet';

export function useObtainProofToken() {
  const unlockVault = useUnlockVault();

  return useCallback(async () => {
    try {
      if (tk.wallet.tonProof.tonProofToken) {
        return true;
      }
      const vault = await unlockVault();
      await tk.wallet.tonProof.obtainProof(await vault.getKeyPair());
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }, [unlockVault]);
}
