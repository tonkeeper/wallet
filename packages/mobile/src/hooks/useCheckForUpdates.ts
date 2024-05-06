import { useEffect } from 'react';
import { useUpdatesStore } from '$store/zustand/updates/useUpdatesStore';
import { openUpdateAppModal } from '$core/ModalContainer/UpdateApp/UpdateApp';
import { useWallet } from '@tonkeeper/shared/hooks';
import Config from 'react-native-config';

export function useCheckForUpdates() {
  const wallet = useWallet();
  const { fetchMeta } = useUpdatesStore((s) => s.actions);
  const shouldUpdate = useUpdatesStore((s) => s.shouldUpdate);
  useEffect(() => {
    if (!wallet) {
      return;
    }
    fetchMeta(Config.CHECK_FOR_UPDATES === 'true');
  }, [fetchMeta, wallet]);

  useEffect(() => {
    if (shouldUpdate) {
      // open update modal
      openUpdateAppModal(Config.CHECK_FOR_UPDATES === 'true');
    }
  }, [shouldUpdate]);
}
