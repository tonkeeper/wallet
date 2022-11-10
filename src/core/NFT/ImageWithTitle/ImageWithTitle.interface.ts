import { ReactNode } from 'react';

export interface ImageWithTitleProps {
  uri?: string;
  lottieUri?: string;
  videoUri?: string;
  title?: string;
  collection?: string;
  isVerified?: boolean;
  description?: string;
  isOnSale: boolean;
  bottom?: ReactNode;
}
