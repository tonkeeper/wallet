export type MaybePromise<T> = T | Promise<T>;

export type Middleware = (next: () => void) => MaybePromise<any>; 

export function applyMiddleware(middlewares: Middleware[], last: () => any) {
  async function dispatch(i: number) {
    let fn = middlewares[i]
    if (i === middlewares.length) {
      return last();
    }
    return fn && fn(dispatch.bind(null, i + 1))
  }

  return dispatch(0);
}
