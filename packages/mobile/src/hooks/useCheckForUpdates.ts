import { useEffect } from 'react';
import { useUpdatesStore } from '$store/zustand/updates/useUpdatesStore';
export function useCheckForUpdates() {
  const { fetchMeta } = useUpdatesStore((s) => s.actions);
  const meta = useUpdatesStore((s) => s.meta);
  useEffect(() => {
    fetchMeta();
  }, []);
  console.log('meta', meta);
}
