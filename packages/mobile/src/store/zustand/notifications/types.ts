export interface INotification {
  title: string;
  dapp_url?: string;
  received_at: number;
  icon_url?: string;
  name?: string;
  link?: string;
}

export interface INotificationsStore {
  notifications: INotification[];
  last_seen: number;
  actions: {
    updateLastSeen: () => void;
    addNotification: (notification: INotification) => void;
    reset: () => void;
    deleteNotificationByReceivedAt: (receivedAt: number) => void;
  };
}
