import { useMethodsToBuyStore } from '$store/zustand/methodsToBuy/useMethodsToBuyStore';
import { IMethod } from '$store/zustand/methodsToBuy/types';
import { useMemo } from 'react';

export function useExchangeMethodInfo(id: string = ''): IMethod | null {
  const allMethods = useMethodsToBuyStore((state) => state.allMethods);

  const method = useMemo(() => {
    return allMethods.find((item) => item.id === id) ?? null;
  }, [allMethods, id]);

  return method;
}
