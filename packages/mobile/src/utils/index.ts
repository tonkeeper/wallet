import { memo } from 'react';

export const chunk = (input: any[], size: number) => {
  return input.reduce((arr, item, idx) => {
    return idx % size === 0
      ? [...arr, [item]]
      : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, []);
};

export function shuffle(a: any[]) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sleep(timeout: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), timeout);
  });
}

export const getStackTrace = function () {
  try {
    const obj: any = {};
    Error.captureStackTrace(obj, getStackTrace);
    return obj.stack;
  } catch (e) {
    return e.stack;
  }
};

export function lowerCaseFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

export function bytesToMegabytes(bytes: number) {
  return (bytes / 1024 / 1024).toFixed(2);
}

export const Memo: <T>(c: T) => T = memo; // Fix generic.

export * from './parseTonLink';
export * from './searchIndexer';
export * from './date';
export * from './color';
export * from './style';
export * from './device';
export * from './linkify';
export * from './statusBar';
export * from './imageName';
export * from './hapticFeedback';
export * from './number';
export * from './wallet';
export * from './biometry';
export * from './delay';
export * from './mergeRefs';
export * from './retry';
export { Base64 } from './base64';
export * from './string';
export * from './nft'; //
export * from './throttle';
export * from './url'; //
export * from './signRawCalculateAmount';
