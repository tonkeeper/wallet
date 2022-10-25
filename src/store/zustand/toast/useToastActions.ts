import { getToastActions } from './selectors';
import { useToastStore } from './useToastStore';
import shallow from 'zustand/shallow';

export const useToastActions = () => {
  const actions = useToastStore(getToastActions, shallow);

  return actions;
};
