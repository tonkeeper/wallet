export interface ListProps {
  align?: 'left' | 'right';
  separator?: boolean;
}

export interface ListCellProps {
  label: string;
  onPress?: () => void;
  align?: 'left' | 'right';
}
