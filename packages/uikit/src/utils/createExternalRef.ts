type Ref<T> = { ref: { current: T | null } };

type ExtrernalRef<T = Record<string, any>> = T & Ref<T>;

export function createExternalRef<T extends {}>(): ExtrernalRef<T> {
  let current: T | null = null;

  const refProxy: Ref<T> = {
    ref: {
      get current() {
        return current;
      },
      set current(value: T | null) {
        current = value;
      },
    },
  };

  const getterFallback = (_, propName: string) => {
    if (
      propName === 'isReactComponent' ||
      propName === 'prototype' ||
      propName === '$$typeof'
    ) {
      return;
    }

    if (__DEV__) {
      console.error(`ExternalRef.${propName} not initialized now`);
    } else {
      console.log(`ExternalRef.${propName} not initialized now`);
    }
  };

  const fallback = new Proxy(function () {}, {
    get: getterFallback,
    apply() {},
  });

  return new Proxy(refProxy, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }

      if (current) {
        if (prop in current) {
          const value = Reflect.get(current, prop, receiver);
          return typeof value == 'function' ? value.bind(target) : value;
        }
      } else {
        getterFallback(undefined, prop as string);
        return fallback;
      }
    },
  }) as ExtrernalRef<T>;
}
