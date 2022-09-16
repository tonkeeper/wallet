import { IconNames } from '$uikit/Icon/generated.types';

export interface FeatureButtonProps {
  title: string;
  iconName?: IconNames;
  color?: string;
  highlightColor?: string;
  onPress?: () => void;
}
