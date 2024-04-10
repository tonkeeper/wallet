import { useEffect } from 'react';
import { ContentProviderPrototype } from './prototype';
import { useInstance } from '$hooks/useInstance';
import { tk } from '$wallet';

export function useContentProvider(fn: () => ContentProviderPrototype<any>) {
  const contentProviderInstance = useInstance(fn);

  useEffect(() => {
    return tk.onChangeWallet(() => {
      contentProviderInstance.setWallet(tk.wallet);
    });
  }, [contentProviderInstance]);

  return contentProviderInstance;
}
