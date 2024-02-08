import React from 'react';
import { config } from '$config';

export function getFlag(key?: string) {
  const flags = config.get('flags');
  if (key) {
    const flag = flags[key];
    if (__DEV__ && flags[key] === undefined) {
      console.log('FLAGS', flags);
      console.warn(`Feature flag ${key} does not exist on config`);
    }

    return flag ?? false;
  }

  return false;
}

export function useFlag(key?: string) {
  return React.useMemo(() => getFlag(key), [key]);
}

export function useFlags<T extends string>(keys?: T[]) {
  return React.useMemo(() => {
    const accumulator = {} as { [key in T]: boolean };
    return (keys ?? []).reduce((acc, key) => {
      acc[key] = getFlag(key);
      return acc;
    }, accumulator);
  }, []);
}
