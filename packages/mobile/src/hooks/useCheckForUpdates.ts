import { useEffect } from 'react';
import { useUpdatesStore } from '$store/zustand/updates/useUpdatesStore';
import { openUpdateAppModal } from '$core/ModalContainer/UpdateApp/UpdateApp';
import { useSelector } from 'react-redux';
import { walletWalletSelector } from '$store/wallet';

export function useCheckForUpdates() {
  const wallet = useSelector(walletWalletSelector);
  const { fetchMeta } = useUpdatesStore((s) => s.actions);
  const shouldUpdate = useUpdatesStore((s) => s.shouldUpdate);
  useEffect(() => {
    if (!wallet) {
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
