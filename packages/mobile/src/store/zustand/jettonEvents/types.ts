import { EventsMap } from '$store/events/interface';

export interface IJettonEventsStore {
  jettons: {
    [index: string]: {
      isLoading: boolean;
      isRefreshing: boolean;
      events: EventsMap;
    };
  };
  actions: {
    fetchJettonEvents: (
      account: string,
      jettonMaster: string,
      isRefresh?: boolean,
    ) => void;
    clearStore: () => void;
  };
}
