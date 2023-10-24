export interface IAppMetadata {
  name: string;
  description?: string;
  icon: string;
  url: string;
  poster?: string;
  textColor?: string;
  excludeCountries?: string[];
  includeCountries?: string[];
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
