import { ReactNode } from 'react';
import { TonThemeColor } from '$styled';

export interface ActionItemBaseProps {
  comment: string;
  isInProgress: boolean;
  borderStart?: boolean;
  borderEnd?: boolean;
  label: string;
  typeLabel: string;
  type: string;
  infoRows: { label?: ReactNode; value?: ReactNode }[];
  labelColor?: TonThemeColor;
  currency?: string;
  bottomContent?: ReactNode;
  isSpam?: boolean;
  handleOpenAction?: () => void;
}
