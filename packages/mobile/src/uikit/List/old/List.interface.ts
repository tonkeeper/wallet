import { ViewProps } from 'react-native';

export interface ListProps extends ViewProps {
  align?: 'left' | 'right';
  separator?: boolean;
}

export interface ListCellProps {
  label: string;
  onPress?: () => void;
  align?: 'left' | 'right';
  children?: React.ReactNode;
}
