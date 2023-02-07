import { useMemo } from 'react';
import { useNotificationStatus, NotificationsStatus } from './useNotificationStatus';

export function useShouldEnableNotifications(): boolean {
  const status = useNotificationStatus();

  return useMemo(
    () => status === NotificationsStatus.DENIED,
    [status],
  );
}
