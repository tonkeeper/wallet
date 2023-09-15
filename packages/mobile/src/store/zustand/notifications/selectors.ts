import { INotificationsStore } from './types';
import { isIOS } from '@tonkeeper/uikit';

export const shouldShowNotifications = (state: INotificationsStore) => {
  return isIOS || state.has_gms;
};
