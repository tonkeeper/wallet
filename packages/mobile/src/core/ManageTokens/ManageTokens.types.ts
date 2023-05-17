import { SpacerSizes } from '$uikit';
import { ListSeparatorProps } from '$uikit/List/ListSeparator';
import { ListItemProps } from '$uikit/List/ListItem';

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
  imageStyle?: ListItemProps['imageStyle'];
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

export type Content = CellItem | TitleItem | SpacerItem;
