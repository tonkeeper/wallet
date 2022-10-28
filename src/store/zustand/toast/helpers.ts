import { IToastStore } from './types';
import { useToastStore } from './useToastStore';

export const Toast: Omit<IToastStore['actions'], 'cancelAutoHide'> = {
  show: (...args) => useToastStore.getState().actions.show(...args),
  success: (...args) => useToastStore.getState().actions.success(...args),
  fail: (...args) => useToastStore.getState().actions.fail(...args),
  loading: (...args) => useToastStore.getState().actions.loading(...args),
  hide: (...args) => useToastStore.getState().actions.hide(...args),
  clear: (...args) => useToastStore.getState().actions.clear(...args),
};
