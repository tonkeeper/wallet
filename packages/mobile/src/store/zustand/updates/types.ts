export enum UpdateState {
  NOT_STARTED = 'NOT_STARTED',
  DOWNLOADING = 'DOWNLOADING',
  DOWNLOADED = 'DOWNLOADED',
  ERRORED = 'ERRORED',
}

export interface IUpdatesStore {
  isLoading: boolean;
  declinedAt?: number;
  shouldUpdate: boolean;
  meta?: {
    version: string;
    size: number;
  };
  update: {
    state: UpdateState;
    progress: number;
  };
  actions: {
    fetchMeta: () => Promise<void>;
    declineUpdate: () => void;
    startUpdate: () => Promise<void>;
  };
}
