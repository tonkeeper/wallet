import { useRef } from 'react';

export function useValueRef<T>(initialValue?: T) {
  const dvalue = useRef(initialValue);

  return {
    get value() {
      return dvalue.current;
    },
    setValue: (newValue: T) => {
      dvalue.current = newValue;
    },
  };
}
