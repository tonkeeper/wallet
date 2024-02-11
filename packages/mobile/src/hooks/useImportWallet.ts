import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { openCreatePin, openSetupNotifications, openSetupWalletDone } from '$navigation';
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

                  const isNotificationsDenied =
                    await tk.wallet.notifications.getIsDenied();

                  dispatch(
                    walletActions.createWallet({
                      pin,
                      isTestnet,
                      onDone: () => {
                        if (isNotificationsDenied) {
                          const withoutCustomize = tk.wallets.size === versions.length;
                          openSetupWalletDone(withoutCustomize);
                          if (withoutCustomize) {
                            dispatch(walletActions.clearGeneratedVault());
                          }
                        } else {
                          openSetupNotifications();
                        }
                        resolve();
                      },
                      onFail: () => {},
                    }),
                  );
                } catch {
                  reject();
                }
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
