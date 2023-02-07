import { useEffect, useState } from "react";
import messaging from '@react-native-firebase/messaging';
import { useAppState } from "./useAppState";

export const NotificationsStatus = messaging.AuthorizationStatus;

export function useNotificationStatus() {
  const appState = useAppState();
  const [notificationsStatus, setNotificationsStatus] = useState(
    messaging.AuthorizationStatus.NOT_DETERMINED,
  );

  // Уточняем пермишн после смены appState. Нужно, чтобы показать актуальный статус после смены настроек
  useEffect(() => {
    async function updateNotificationsStatus() {
      const status = await messaging().hasPermission();
      setNotificationsStatus(status);
    }
    updateNotificationsStatus();
  }, [appState]);

  return notificationsStatus;
}