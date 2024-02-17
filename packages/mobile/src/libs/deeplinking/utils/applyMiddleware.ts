import type { DeeplinkingResolverOptions } from '../deeplinking.types';

export type MaybePromise<T> = T | Promise<T>;

type MiddlewareParams = DeeplinkingResolverOptions & { pathname: string };

export type Middleware = (
  next: () => void,
  options: MiddlewareParams,
) => MaybePromise<any>;

export function applyMiddleware(
  middlewares: Middleware[],
  params: MiddlewareParams,
  last: () => any,
) {
  async function dispatch(i: number) {
    let fn = middlewares[i];
    if (i === middlewares.length) {
      return last();
    }
    return fn && fn(dispatch.bind(null, i + 1), params);
  }

  return dispatch(0);
}
