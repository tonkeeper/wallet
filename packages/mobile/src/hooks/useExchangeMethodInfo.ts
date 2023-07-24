import { useMethodsToBuyStore } from '$store/zustand/methodsToBuy/useMethodsToBuyStore';
import { IMethod } from '$store/zustand/methodsToBuy/types';
import { useMemo } from 'react';

export function useExchangeMethodInfo(id: string = ''): IMethod | null {
  const categories = useMethodsToBuyStore((state) => state.categories);

  const method = useMemo(() => {
    for (const category of categories) {
      const method = category.items.find((item) => item.id === id);
      if (method) {
        return method;
      }
    }
    return null;
  }, [categories, id]);

  return method;
}
