export function throttle<T extends (...args: any[]) => any>(f: T, wait: number): T {
  let isCalled = false;
  let savedArgs: any[] | null;

  const wrapper = ((...args: any[]) => {
    if (isCalled) {
      savedArgs = args;
      return;
    }

    f(...args);
    isCalled = true;

    setTimeout(() => {
      isCalled = false;
      // Call last invoke
      // if (savedArgs) {
      //   wrapper(...args);
      //   savedArgs = null;
      // }
    }, wait);
  }) as any;

  return wrapper;
}
