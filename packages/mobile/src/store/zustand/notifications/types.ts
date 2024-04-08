export enum NotificationType {
  CONSOLE_DAPP_NOTIFICATION = 'console_dapp_notification',
  BETTER_STAKE_OPTION_FOUND = 'better_stake_option_found',
  COLLECT_STAKE = 'collect_stake',
}

export interface INotification {
  type: NotificationType;
  message: string;
  dapp_url?: string;
  received_at: number;
  icon_url?: string;
  name?: string;
  link?: string;
  deeplink?: string;
}

export interface INotificationsState {
  notifications: INotification[];
  last_seen: number;
  last_seen_activity_screen: number;
  should_show_red_dot: boolean;
  showRestakeBanner?: boolean;
  stakingAddressToMigrateFrom?: string;
  bypassUnstakeStep?: boolean;
}

export interface INotificationsStore {
  has_gms: boolean;
  wallets: {
    [walletAddress: string]: INotificationsState;
  };
  actions: {
    updateLastSeenActivityScreen: (rawAddress: string) => void;
    updateLastSeen: (rawAddress: string) => void;
    addNotification: (notification: INotification, rawAddress: string) => void;
    reset: () => void;
    deleteNotificationByReceivedAt: (receivedAt: number, rawAddress: string) => void;
    removeNotificationsByDappUrl: (dapp_url: string, rawAddress: string) => void;
    removeRedDot: (rawAddress: string) => void;
    toggleRestakeBanner: (
      rawAddress: string,
      showRestakeBanner: boolean,
      stakingAddressToMigrateFrom?: string,
    ) => void;
    bypassUnstakeStep: (rawAddress: string) => void;
  };
}
