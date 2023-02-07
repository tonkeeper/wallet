import { Address } from 'ton-core';

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  cooldown: number
) {
  let lastArgs: Args | undefined;

  const run = () => {
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = undefined;
    }
  };

  const throttled = (...args: Args) => {
    const isOnCooldown = !!lastArgs;

    lastArgs = args;

    if (isOnCooldown) {
      return;
    }

    window.setTimeout(run, cooldown);
  };

  return throttled;
}

export const toShortAddress = (address: string, length = 4): string => {
  return toShortValue(Address.parse(address).toString(), length);
};

export const toShortValue = (value: string, length = 4): string => {
  return value.slice(0, length) + '...' + value.slice(-length);
};

export function formatTransferUrl(
  address: string,
  amount?: string,
  text?: string
) {
  let url = 'ton://transfer/' + Address.parse(address).toString();

  const params = [];

  if (amount) {
    params.push('amount=' + amount);
  }
  if (text) {
    params.push('text=' + encodeURIComponent(text));
  }

  if (params.length === 0) return url;

  return url + '?' + params.join('&');
}
