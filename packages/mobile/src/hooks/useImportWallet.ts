import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { openCreatePin, openSetupWalletDone } from '$navigation';
import { walletActions } from '$store/wallet';
import { getLastEnteredPasscode } from '$store/wallet/sagas';
import { tk } from '$wallet';
import { WalletContractVersion } from '$wallet/WalletTypes';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

export const useImportWallet = () => {
  const dispatch = useDispatch();
  const unlockVault = useUnlockVault();

  const restore = useCallback(
    (
      mnemonic: string,
      lockupConfig: {},
      versions: WalletContractVersion[],
      isTestnet: boolean,
    ) => {
      return new Promise<void>((resolve, reject) => {
        dispatch(
          walletActions.restoreWallet({
            mnemonic,
            versions,
            config: lockupConfig,
            onDone: async () => {
              if (tk.walletForUnlock) {
                try {
                  await unlockVault();
                  const pin = getLastEnteredPasscode();

                  dispatch(
                    walletActions.createWallet({
                      pin,
                      isTestnet,
                      onDone: () => {
                        openSetupWalletDone(tk.wallets.size === versions.length);
                        resolve();
                      },
                      onFail: () => {},
                    }),
                  );
                } catch {}
              } else {
                openCreatePin();
                resolve();
              }
            },
            onFail: reject,
          }),
        );
      });
    },
    [dispatch, unlockVault],
  );

  return restore;
};
