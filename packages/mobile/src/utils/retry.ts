import { delay as delayFn } from './delay';

export const retry = async (
  fn: Function,
  options: {
    delay?: number;
    attempt?: number;
  } 
): Promise<void> => {
  const { attempt = 3, delay = 0 } = options;
  return fn().catch(async (error: Error) => {
    if (attempt <= 0) {
      return Promise.reject(error);
    }

    if (delay > 0) {
      await delayFn(delay);
    }

    return retry(fn, { attempt: attempt - 1, delay });
  });
}
  