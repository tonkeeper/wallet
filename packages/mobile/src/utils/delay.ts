import debounce from 'lodash/debounce';

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function asyncDebounce<T extends (...args: any) => Promise<any>>(
  func: T,
  wait: number,
): T {
  const throttled = debounce((resolve, reject, args) => {
    func(...args)
      .then(resolve)
      .catch(reject);
  }, wait);
  return ((...args) =>
    new Promise((resolve, reject) => {
      throttled(resolve, reject, args);
    })) as unknown as T;
}
