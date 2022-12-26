export enum SearchEngine {
  DuckDuckGo = 'DuckDuckGo',
  Google = 'Google',
}

export interface IBrowserStore {
  searchEngine: SearchEngine;
  actions: {
    setSearchEngine: (searchEngine: SearchEngine) => void;
  };
}
