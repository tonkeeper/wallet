import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useMemo} from 'react';
import { useShouldEnableNotifications } from './useShouldEnableNotifications';

type NotificationsBadgeContextValue = {
  hide: () => void;
  isVisible: boolean;
}

export const NotificationsBadgeContext = React.createContext<NotificationsBadgeContextValue | null>(null);

export const useNotificationsBadgeStore = () => {
  const shouldEnableNotification = useShouldEnableNotifications();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      const isHidden = await AsyncStorage.getItem('HiddenNotificationsBadge');
      const isVisible = shouldEnableNotification && !Boolean(isHidden);

      setIsVisible(isVisible);
    };

    init();
  }, [shouldEnableNotification]);

  const hide = React.useCallback(async () => {
    try {
      await AsyncStorage.setItem('HiddenNotificationsBadge', 'true');
    } catch(err) {}
    setIsVisible(false);
  }, []);

  return useMemo(() => ({ hide, isVisible }), [hide, isVisible]);
};

export const NotificationsBadgeProvider: React.FC = ({ children }) => {
  const store = useNotificationsBadgeStore();

  return (
    <NotificationsBadgeContext.Provider value={store}>
      {children}
    </NotificationsBadgeContext.Provider>
  );
}

export function useNotificationsBadge() {
  const store = React.useContext(NotificationsBadgeContext);

  if (!store) {
    throw new Error('No NotificationsBadgeProvider');
  }

  return store;
}
