import { useRef, useState } from 'react';

type InitialFunc<T> = () => T;

export const useInstance = <T>(
  initialValue?: InitialFunc<T> | T
): T => {
  const ref = useRef<T>();

  if (!ref.current && initialValue) {
    const value = 
      typeof initialValue === 'function' 
        ? (initialValue as InitialFunc<T>)() 
        : initialValue;

    ref.current = value;
  }

  return ref.current!;
};
