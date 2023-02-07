export interface IAppMetadata {
  name: string;
  description?: string;
  icon: string;
  url: string;
}

export interface IAppCategory {
  id: string;
  title: string;
  apps: IAppMetadata[];
}

export interface IAppsListStore {
  fetching: boolean;
  appsList: IAppMetadata[];
  categories: IAppCategory[];
  moreEnabled: boolean;
  moreUrl: string;
  actions: {
    fetchPopularApps: () => void;
  };
}
