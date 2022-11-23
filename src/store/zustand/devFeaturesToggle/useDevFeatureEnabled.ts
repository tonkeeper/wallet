import { DevFeature, useDevFeaturesToggle } from '$store';

export const useDevFeatureEnabled = (feature: DevFeature) => {
  const { devFeatures } = useDevFeaturesToggle();

  return devFeatures[feature];
};
