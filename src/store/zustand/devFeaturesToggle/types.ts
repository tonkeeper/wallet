export enum DevFeature {
  TonConnectV2 = 'TonConnectV2',
}

export interface IDevFeaturesToggleStore {
  devFeatures: { [key in DevFeature]: boolean };
  actions: {
    toogleFeature: (feature: DevFeature) => void;
  };
}
