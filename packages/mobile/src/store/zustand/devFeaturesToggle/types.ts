export enum DevFeature {
  UseHttpProtocol = 'UseHttpProtocol',
}

export interface IDevFeaturesToggleStore {
  devFeatures: { [key in DevFeature]: boolean };
  actions: {
    toggleFeature: (feature: DevFeature) => void;
  };
}
