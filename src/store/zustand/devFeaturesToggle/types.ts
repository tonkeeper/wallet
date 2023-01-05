export enum DevFeature {
  Example = 'Example',
}

export interface IDevFeaturesToggleStore {
  devFeatures: { [key in DevFeature]: boolean };
  actions: {
    toogleFeature: (feature: DevFeature) => void;
  };
}
