import { ReactElement } from 'react';

export interface RoundedSectionListItem {
  key: string;
  index?: number;
}

export interface RoundedSectionListProps<T extends RoundedSectionListItem> {
  sections: {
    title?: string;
    data: T[];
  }[];
  renderItem: (item: T, index: number) => ReactElement;
  onItemPress: (item: T) => void;
  contentContainerStyle?: any;
  onScroll?: () => void;
}
