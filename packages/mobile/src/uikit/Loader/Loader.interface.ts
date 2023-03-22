import { TonThemeColor } from '$styled';

export type LoaderSizes = 'medium' | 'large' | 'xlarge' | 'small';
export interface LoaderProps {
  size: LoaderSizes;
  color?: TonThemeColor;
}
