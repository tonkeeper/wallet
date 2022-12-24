export enum SearchEngine {
  Google = 'Google',
  DuckDuckGo = 'DuckDuckGo',
}

export interface IBrowserStore {
  searchEngine: SearchEngine;
  actions: {
    setSearchEngine: (searchEngine: SearchEngine) => void;
  };
}
