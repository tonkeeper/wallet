import { IconNames } from '$uikit/Icon/generated.types';
import React, { ReactElement } from 'react';

export interface CellProps {
  onPress?: () => void;
  skipSeparator?: boolean;
  icon?: IconNames;
  indicator?: ReactElement;
  inlineContent?: ReactElement | JSX.Element | null;
  content?: React.ReactNode;
}
