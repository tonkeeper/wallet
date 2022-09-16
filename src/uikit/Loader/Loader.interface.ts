import { TonThemeColor } from '$styled';

export type LoaderSizes = 'medium' | 'large' | 'xlarge';
export interface LoaderProps {
  size: LoaderSizes;
  color?: TonThemeColor;
}
