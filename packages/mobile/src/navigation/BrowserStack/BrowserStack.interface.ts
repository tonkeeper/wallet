import { BrowserStackRouteNames } from '../navigationNames';

export type BrowserStackParamList = {
  [BrowserStackRouteNames.Explore]: {
    initialCategory?: string;
  };
  [BrowserStackRouteNames.Category]: {
    categoryId: string;
  };
};
