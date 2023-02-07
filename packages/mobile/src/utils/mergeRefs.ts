import React from "react";

export function mergeRefs<T>(
  ...args: React.ElementRef<any>[]
): (node: T | null) => any {
  return function forwardRef(node: T | null) {
    args.forEach((ref: any) => {
      if (ref == null) {
        return;
      }
      if (typeof ref === 'function') {
        ref(node);
        return;
      }
      if (typeof ref === 'object') {
        ref.current = node;
        return;
      }
      console.error(
        `mergeRefs cannot handle Refs of type boolean, number or string, received ref ${String(
          ref
        )}`
      );
    });
  };
}

export function useMergeRefs<T>(
  ...args: React.ElementRef<any>[]
): (node: T | null) => void {
  return React.useMemo(
    () => mergeRefs(...args),
    // eslint-disable-next-line
    [...args]
  );
}