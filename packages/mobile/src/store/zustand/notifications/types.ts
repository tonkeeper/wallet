export interface INotification {
  title: string;
  dapp_url?: string;
  received_at: number;
  icon_url?: string;
  name?: string;
}

export interface INotificationsStore {
  notifications: INotification[];
  notifications_token?: string | null;
  last_seen: number;
  actions: {
    updateLastSeen: () => void;
    addNotification: (notification: INotification) => void;
    reset: () => void;
    deleteNotificationByReceivedAt: (receivedAt: number) => void;
    setNotificationsToken: (token: string) => void;
  };
}
