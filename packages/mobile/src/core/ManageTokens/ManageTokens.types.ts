import { SpacerSizes } from '$uikit';
import { ReactNode } from 'react';
import { TonThemeColor } from '$styled';
import { ListSeparatorProps } from '$uikit/List/new/ListSeparator';

export enum ContentType {
  Title,
  Cell,
  Spacer,
}

export type TitleItem = {
  type: ContentType.Title;
  title: string;
  id: string;
};

export type SpacerItem = {
  type: ContentType.Spacer;
  bottom: SpacerSizes;
  id: string;
};

export type CellItem = {
  separatorVariant?: ListSeparatorProps['variant'];
  type: ContentType.Cell;
  chevronColor?: TonThemeColor;
  isFirst?: boolean;
  leftContent?: ReactNode;
  attentionBackground?: boolean;
  title?: string;
  chevron?: boolean;
  subtitle?: string;
  isLast?: boolean;
  picture?: string;
  onPress?: () => void;
  isDraggable?: boolean;
  id: string;
};

export type Content = CellItem | TitleItem | SpacerItem;
