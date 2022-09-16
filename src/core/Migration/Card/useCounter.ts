import { useCallback, useEffect, useRef, useState } from 'react';
import BigNumber from 'bignumber.js';

export function useCounter(
  delayMs: number,
  duration: number,
  amount: string,
  mode: 'incr' | 'decr',
  startValue: string = '0',
) {
  const [isStarted, setStarted] = useState(false);
  const [value, setValue] = useState(mode === 'decr' ? amount : startValue);
  const timer = useRef<any>(0);
  const interval = useRef<any>(0);

  const onUpdate = useCallback(
    (step) => () => {
      setValue((oldValue) => {
        let newVal = new BigNumber(oldValue);
        if (mode === 'incr') {
          newVal = newVal.plus(step);

          const maxVal = new BigNumber(amount).plus(startValue);
          if (newVal.isGreaterThan(maxVal)) {
            newVal = maxVal;
            clearInterval(interval.current);
          }
        } else {
          newVal = newVal.minus(step);

          if (newVal.isLessThan(0)) {
            newVal = new BigNumber(0);
            clearInterval(interval.current);
          }
        }

        return newVal.toString();
      });
    },
    [amount, mode, setValue],
  );

  useEffect(() => {
    if (isStarted) {
      const stepDuration = 50;
      const step = new BigNumber(amount).dividedBy(duration / stepDuration);
      interval.current = setInterval(onUpdate(step), stepDuration);
    }

    return () => {
      clearInterval(interval.current);
    };
  }, [isStarted]);

  useEffect(() => {
    timer.current = setTimeout(() => {
      setStarted(true);
    }, delayMs);

    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  return value;
}
