import { useCallback, useEffect } from 'react';
import { useFlashCountStore } from './useFlashCountStore';
import { FlashCountKeys } from './types';

const DISABLED_COUNT = 999;

export const useFlashCount = (key: FlashCountKeys): [number, () => void] => {
  const { flashCounts, increaseFlashCount } = useFlashCountStore();

  const currentCounts = flashCounts[key];

  useEffect(() => {
    if (currentCounts === DISABLED_COUNT) {
      return;
    }

    const timerId = setTimeout(() => increaseFlashCount(key), 1000);

    return () => {
      clearTimeout(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disable = useCallback(() => {
    if (currentCounts === DISABLED_COUNT) {
      return;
    }
    return increaseFlashCount(key, DISABLED_COUNT);
  }, [currentCounts, increaseFlashCount, key]);

  return [currentCounts, disable];
};
