import { SpacerSizes } from '$uikit';
import { ListItemProps } from '@tonkeeper/uikit/src/components/List/ListItem';
import { ReactNode } from 'react';

export enum ContentType {
  Title,
  Cell,
  Spacer,
  ShowAllButton,
}

export type TitleItem = {
  type: ContentType.Title;
  title: string;
  rightContent?: ReactNode;
  id: string;
};

export type SpacerItem = {
  type: ContentType.Spacer;
  bottom: SpacerSizes;
  id: string;
};

export type ShowAllButtonItem = {
  type: ContentType.ShowAllButton;
  onPress: () => void;
  id: string;
};

export type CellItem = {
  type: ContentType.Cell;
  imageStyle?: ListItemProps['pictureStyle'];
  chevronColor?: ListItemProps['chevronColor'];
  isFirst?: boolean;
  leftContent?: ListItemProps['leftContent'];
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

export type Content = CellItem | TitleItem | SpacerItem | ShowAllButtonItem;
