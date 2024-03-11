import { useWallet } from '@tonkeeper/shared/hooks';
import { useExternalState } from '@tonkeeper/shared/hooks/useExternalState';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useConnectedAppsStore } from '$store';
import { tk } from '$wallet';
import { useAppState } from './useAppState';
import { WalletNetwork } from '$wallet/WalletTypes';
import { Toast } from '@tonkeeper/uikit';
import { ToastSize } from '@tonkeeper/uikit/src/components/Toast';
import { t } from '@tonkeeper/shared/i18n';
import { Linking } from 'react-native';

export const useNotificationsSwitch = () => {
  const wallet = useWallet();
  const { isSubscribed: isWalletSubscribed } = useExternalState(
    wallet.notifications.state,
  );

  const isSwitchFrozen = useRef(false);

  const [isSubscribed, setIsSubscribed] = useState(isWalletSubscribed);
  const [isDenied, setIsDenied] = useState(false);
  const appState = useAppState();

  useEffect(() => {
    if (appState === 'active') {
      const updateStatus = async () => {
        setIsDenied(await tk.wallet.notifications.getIsDenied());
      };
      updateStatus();
    }
  }, [appState]);

  useEffect(() => {
    setIsSubscribed(isWalletSubscribed);
  }, [isWalletSubscribed]);

  const toggleNotifications = useCallback(
    async (value: boolean) => {
      if (isSwitchFrozen.current) {
        return;
      }

      try {
        isSwitchFrozen.current = true;
        setIsSubscribed(value);

        const isSuccess = value
          ? await wallet.notifications.subscribe()
          : await wallet.notifications.unsubscribe();

        if (value) {
          useConnectedAppsStore
            .getState()
            .actions.updateNotificationsSubscription(
              wallet.config.network === WalletNetwork.mainnet ? 'mainnet' : 'testnet',
              wallet.address.ton.friendly,
            );
        }

        if (!isSuccess) {
          setIsSubscribed(!value);
        }
      } catch (err) {
        Toast.fail(t('notifications_not_supported'), { size: ToastSize.Small });
        setIsSubscribed(!value);
      } finally {
        isSwitchFrozen.current = false;
      }
    },
    [wallet],
  );

  const openSettings = useCallback(() => Linking.openSettings(), []);

  const isAvailable = wallet.notifications.isAvailable;

  return { isAvailable, isSubscribed, isDenied, toggleNotifications, openSettings };
};
