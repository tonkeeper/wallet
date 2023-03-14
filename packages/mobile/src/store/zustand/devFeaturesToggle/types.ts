export enum DevFeature {
  UseHttpProtocol = 'UseHttpProtocol',
  NewFlow = 'NewFlow',
}

export interface IDevFeaturesToggleStore {
  devFeatures: { [key in DevFeature]: boolean };
  actions: {
    toggleFeature: (feature: DevFeature) => void;
  };
}
