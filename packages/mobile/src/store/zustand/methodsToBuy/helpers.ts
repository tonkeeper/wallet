import { useMethodsToBuyStore } from '$store/zustand/methodsToBuy/useMethodsToBuyStore';
import { flatten } from 'lodash';
export function getFlatMethodsArray() {
  return flatten(
    useMethodsToBuyStore.getState().categories.map((category) => category.items),
  );
}

export function isMethodIdExists(methodId: string) {
  return getFlatMethodsArray()
    .map((method) => method.id)
    .includes(methodId);
}
