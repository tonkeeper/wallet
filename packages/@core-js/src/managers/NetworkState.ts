import { Storage } from '../declarations/Storage';
import { State } from '../utils/State';

export enum NetworkStatus {
  Online = 'online',
  Offline = 'offline',
  Connecting = 'connecting',
  Updating = 'updating',
}

type NetworkStateData = {
  status: NetworkStatus;
  lastSyncedTimestamp?: number | null;
};

export class NetworkState {
  public state = new State<NetworkStateData>({
    status: NetworkStatus.Connecting,
    lastSyncedTimestamp: null,
  });

  constructor(private storage: Storage) {
    this.state.persist({
      partialize: ({ lastSyncedTimestamp }) => ({ lastSyncedTimestamp }),
      key: 'LastSyncedTimestamp',
      storage: this.storage,
    });
  }

  public setStatus(status: NetworkStatus) {
    const { status: prevStatus, lastSyncedTimestamp } = this.state.data;
    if (prevStatus !== status) {
      this.state.set({
        status,
        lastSyncedTimestamp:
          status === NetworkStatus.Online ? new Date().getTime() : lastSyncedTimestamp,
      });
    }
  }
}
