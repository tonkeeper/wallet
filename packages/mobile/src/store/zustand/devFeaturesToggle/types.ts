export enum DevFeature {
  UseHttpProtocol = 'UseHttpProtocol',
  W5StoriesShown = 'W5StoriesShown',
}

export interface IDevFeaturesToggleStore {
  devFeatures: { [key in DevFeature]: boolean };
  devLanguage: null | string;
  actions: {
    toggleFeature: (feature: DevFeature) => void;
    setDevLanguage: (language?: string) => void;
  };
}
