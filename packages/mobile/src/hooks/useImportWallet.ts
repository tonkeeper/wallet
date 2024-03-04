import { useUnlockVault } from '$core/ModalContainer/NFTOperations/useUnlockVault';
import { openSetupNotifications, openSetupWalletDone } from '$navigation';
import { walletActions } from '$store/wallet';
import { getLastEnteredPasscode } from '$store/wallet/sagas';
import { tk } from '$wallet';
import { WalletContractVersion } from '$wallet/WalletTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import { network } from '@tonkeeper/core';
import { config } from '$config';
import { useNavigation } from '@tonkeeper/router';
import { ImportWalletStackRouteNames } from '$navigation/ImportWalletStack/types';

export const useImportWallet = () => {
  const dispatch = useDispatch();
  const unlockVault = useUnlockVault();
  const nav = useNavigation();

  const restore = useCallback(
    (
      mnemonic: string,
      lockupConfig: any,
      versions: WalletContractVersion[],
      isTestnet: boolean,
      isMigration?: boolean,
    ) => {
      return new Promise<void>((resolve, reject) => {
        dispatch(
          walletActions.restoreWallet({
            mnemonic,
            versions,
            config: lockupConfig,
            onDone: async () => {
              if (isMigration) {
                const pin = getLastEnteredPasscode();

                dispatch(
                  walletActions.createWallet({
                    pin,
                    isTestnet,
                    onDone: async (identifiers) => {
                      tk.setMigrated();
                      tk.saveLastBackupTimestampAll(identifiers, true);

                      dispatch(walletActions.clearGeneratedVault());

                      // Enable notifications if it was enabled before migration
                      try {
                        const [isNotificationsDenied, status] = await Promise.all([
                          tk.wallet.notifications.getIsDenied(),
                          AsyncStorage.getItem('isSubscribeNotifications'),
                        ]);

                        if (!isNotificationsDenied && status === 'true') {
                          // unsubscribe from all wallet versions
                          await network.post(
                            `${config.get('tonapiIOEndpoint')}/unsubscribe`,
                            {
                              params: {
                                device: DeviceInfo.getUniqueId(),
                              },
                            },
                          );

                          // subscribe to selected wallet versions
                          tk.enableNotificationsForAll(identifiers).catch(null);
                        }
                      } catch {}
                      // Enable biometry if it was enabled before migration
                      try {
                        const isBiometryEnabled =
                          (await AsyncStorage.getItem('biometry_enabled')) === 'yes';

                        if (isBiometryEnabled) {
                          tk.enableBiometry(pin).catch(null);
                        }
                      } catch {}

                      resolve();
                    },
                    onFail: reject,
                  }),
                );
                return;
              }

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
                      onDone: (identifiers) => {
                        tk.saveLastBackupTimestampAll(identifiers);
                        if (isNotificationsDenied || isTestnet) {
                          openSetupWalletDone(identifiers);
                        } else {
                          openSetupNotifications(identifiers);
                        }
                        resolve();
                      },
                      onFail: reject,
                    }),
                  );
                } catch {
                  reject();
                }
              } else {
                nav.navigate(ImportWalletStackRouteNames.CreatePasscode, {
                  isImport: true,
                });
                resolve();
              }
            },
            onFail: reject,
          }),
        );
      });
    },
    [dispatch, nav, unlockVault],
  );

  return restore;
};
