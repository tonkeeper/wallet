import { delay } from "./network.utils";

export type BackoffOptions = {
  attempt?: number;
  delay?: number;
}

export async function backoff<T>(cb: () => Promise<T>, repeat?: number): Promise<T> {
  while (true) {
    try {
      return await cb();
    } catch (e) {
      if (repeat !== undefined && !repeat--) {
        throw (e);
      }
      console.warn(e);
      await delay(1000);
    }
  }
};