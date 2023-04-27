import { TabsStackRouteNames } from '$navigation';

export type TabStackParamList = {
  [TabsStackRouteNames.Balances]: {};
  [TabsStackRouteNames.Activity]: {};
  [TabsStackRouteNames.NFT]: {};
  [TabsStackRouteNames.Explore]: {
    initialCategory?: string;
  };
  [TabsStackRouteNames.SettingsStack]: {};
};
