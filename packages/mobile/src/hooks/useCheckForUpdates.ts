import { useEffect } from 'react';
import { useUpdatesStore } from '$store/zustand/updates/useUpdatesStore';
import { openUpdateAppModal } from '$core/ModalContainer/UpdateApp/UpdateApp';
import { useSelector } from 'react-redux';
import { walletWalletSelector } from '$store/wallet';
import { Platform } from 'react-native';
import Config from 'react-native-config';

const SHOULD_CHECK_FOR_UPDATES =
  Platform.OS === 'android' && Config.CHECK_FOR_UPDATES !== 'true';

export function useCheckForUpdates() {
  const wallet = useSelector(walletWalletSelector);
  const { fetchMeta } = useUpdatesStore((s) => s.actions);
  const shouldUpdate = useUpdatesStore((s) => s.shouldUpdate);
  useEffect(() => {
    if (!wallet || !SHOULD_CHECK_FOR_UPDATES) {
      return;
    }
    fetchMeta();
  }, [fetchMeta]);

  useEffect(() => {
    if (shouldUpdate) {
      // open update modal
      openUpdateAppModal();
    }
  }, [shouldUpdate]);
}
