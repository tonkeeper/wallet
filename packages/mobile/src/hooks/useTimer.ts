import { useEffect, useState } from 'react';
import { differenceInHours, differenceInMinutes, differenceInSeconds, subHours, subMinutes } from 'date-fns';

export const useTimer = (endAt: number): string => {
  const [now, setNow] = useState(Date.now());

  const updateDiff = () => {
    setNow(Date.now());
  };

  useEffect(() => {
    const interval = setInterval(updateDiff, 1000);
    return () => clearInterval(interval);
  }, []);

  let hours = String(differenceInHours(endAt, now));
  if (+hours < 10) {
    hours = `0${hours}`;
  }

  let endAtModified = subHours(endAt, +hours);
  let minutes = String(differenceInMinutes(endAtModified, now));
  if (+minutes < 10) {
    minutes = `0${minutes}`;
  }

  endAtModified = subMinutes(endAtModified, +minutes);
  let seconds = String(differenceInSeconds(endAtModified, now));
  if (+seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${hours}:${minutes}:${seconds}`;
};
