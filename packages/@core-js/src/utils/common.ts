export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function throttle<Args extends unknown[]>(
  fn: (...args: Args) => void,
  cooldown: number,
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

export function excludeUndefinedValues<T extends object>(obj: T): T {
  return Object.keys(obj).reduce((acc, key) => {
    const _acc = acc;
    if (obj[key] !== undefined) _acc[key] = obj[key];
    return _acc;
  }, {} as T);
}
