import { useEffect, useState } from 'react';
import { intervalToDuration } from 'date-fns';
import { interpolate, useDerivedValue } from 'react-native-reanimated';
import { useTranslator } from './useTranslator';

export const useStakingCycle = (cycleStart: number, cycleEnd: number, enabled = true) => {
  const t = useTranslator();

  const [now, setNow] = useState(Date.now());

  const startTimestamp = cycleStart * 1000;
  const endTimestamp = cycleEnd * 1000;

  const duration = intervalToDuration({ start: now, end: endTimestamp });

  const progress = useDerivedValue(
    () => interpolate(now, [startTimestamp, endTimestamp], [0, 1]),
    [now],
  );

  const formattedDuration = t('staking.details.next_cycle.time', {
    time: `${duration.hours! + duration.days! * 24}:${
      duration.minutes! < 10 ? `0${duration.minutes}` : duration.minutes
    }:${duration.seconds! < 10 ? `0${duration.seconds}` : duration.seconds}`,
  });

  useEffect(() => {
    if (enabled) {
      setNow(Date.now());
      const timerId = setInterval(() => {
        setNow(Date.now());
      }, 1000);

      return () => {
        clearInterval(timerId);
      };
    }
  }, [enabled]);

  return { duration, formattedDuration, progress };
};
