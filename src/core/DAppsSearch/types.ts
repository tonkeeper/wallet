export enum SearchSuggestSource {
  DIRECT_LINK,
  APP,
  HISTORY,
  SEARCH_ENGINE,
}

export interface ISearchSuggest {
  url: string;
  icon?: string;
  name?: string;
  source: SearchSuggestSource;
}

export interface IWebSearchSuggest {
  url: string;
  title: string;
}
