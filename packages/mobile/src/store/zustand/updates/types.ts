export interface IUpdatesStore {
  isLoading: boolean;
  declinedAt?: number;
  meta?: {
    version: string;
    size: number;
  };
  actions: {
    fetchMeta: () => Promise<void>;
  };
}
