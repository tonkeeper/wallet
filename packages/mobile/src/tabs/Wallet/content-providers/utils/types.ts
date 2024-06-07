import { ListItemProps } from '@tonkeeper/uikit/src/components/List/ListItem';
import { ReactNode } from 'react';
import { TonIconProps } from '@tonkeeper/uikit';

export enum Trend {
  Positive = 'positive',
  Negative = 'negative',
  Neutral = 'neutral',
}

export type FiatRate = {
  total: {
    formatted: string;
    in_ton: string;
    raw: string;
  };
  percent?: string;
  trend: Trend;
  price: {
    formatted: string;
    raw: string;
  };
};

export type CellItemToRender = {
  isFirst?: boolean;
  RenderComponent?: React.JSXElementConstructor<any>;
  passProps?: Record<string, any>;
  isLast?: boolean;
  key: string;
  renderPriority: number;
  subtitleStyle?: ListItemProps['subtitleStyle'];
  onPress?: () => void;
  title: string;
  subtitle?: string;
  value?: string | ReactNode;
  subvalue?: string;
  fiatRate?: FiatRate;
  picture?: string;
  tonIcon?: boolean | TonIconProps;
  tag?: string;
};
