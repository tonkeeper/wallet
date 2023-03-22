export enum DevFeature {
  UseHttpProtocol = 'UseHttpProtocol',
  NewFlow = 'NewFlow',
  Staking = 'Staking',
}

export interface IDevFeaturesToggleStore {
  devFeatures: { [key in DevFeature]: boolean };
  actions: {
    toggleFeature: (feature: DevFeature) => void;
  };
}
