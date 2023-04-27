import { SpacerSizes } from '$uikit';
import { ReactNode } from 'react';

export enum ContentType {
  Title,
  Cell,
  Spacer,
}

export type TitleItem = {
  type: ContentType.Title;
  title: string;
};

export type SpacerItem = {
  type: ContentType.Spacer;
  bottom: SpacerSizes;
};

export type CellItem = {
  type: ContentType.Cell;
  isFirst?: boolean;
  leftContent?: ReactNode;
  attentionBackground?: boolean;
  title?: string;
  chevron?: boolean;
  subtitle?: string;
  isLast?: boolean;
  picture?: string;
  onPress?: () => void;
};

export type Content = CellItem | TitleItem | SpacerItem;
