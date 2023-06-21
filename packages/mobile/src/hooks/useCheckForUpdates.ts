import { useEffect } from 'react';
import { useUpdatesStore } from '$store/zustand/updates/useUpdatesStore';
import { openUpdateAppModal } from '$core/ModalContainer/UpdateApp/UpdateApp';
export function useCheckForUpdates() {
  const { fetchMeta } = useUpdatesStore((s) => s.actions);
  const shouldUpdate = useUpdatesStore((s) => s.shouldUpdate);
  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  useEffect(() => {
    if (shouldUpdate) {
      // open update modal
      openUpdateAppModal();
    }
  }, [shouldUpdate]);
}
