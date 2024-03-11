import { IToastStore } from './types';
import { useToastStore } from './useToastStore';
import { Toast as NewToast } from '@tonkeeper/uikit';

export const Toast: Omit<IToastStore['actions'], 'cancelAutoHide'> = {
  show: (...args) => useToastStore.getState().actions.show(...args),
  success: (...args) => useToastStore.getState().actions.success(...args),
  warning: (...args) => useToastStore.getState().actions.warning(...args),
  fail: (...args) => useToastStore.getState().actions.fail(...args),
  loading: (...args) => useToastStore.getState().actions.loading(...args),
  hide: (...args) => useToastStore.getState().actions.hide(...args),
  clear: (...args) => useToastStore.getState().actions.clear(...args),
};

NewToast.ref.current = Toast;
