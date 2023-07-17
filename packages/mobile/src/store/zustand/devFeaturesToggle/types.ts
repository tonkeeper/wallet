export enum DevFeature {
  UseHttpProtocol = 'UseHttpProtocol',
  Tonstakers = 'Tonstakers',
}

export interface IDevFeaturesToggleStore {
  devFeatures: { [key in DevFeature]: boolean };
  devLanguage: null | string;
  actions: {
    toggleFeature: (feature: DevFeature) => void;
    setDevLanguage: (language?: string) => void;
  };
}
