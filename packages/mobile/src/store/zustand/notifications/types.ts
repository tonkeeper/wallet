export interface INotification {
  title: string;
  service_url: string;
  received_at: number;
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
