export interface IBatteryUIStore {
  isViewedBatteryScreen: boolean;
  actions: {
    setIsViewedBatteryScreen: (isViewed: boolean) => void;
  };
}
