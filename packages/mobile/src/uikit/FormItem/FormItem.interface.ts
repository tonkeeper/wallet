import React, { ReactNode } from 'react';

export interface FormItemProps {
  children: ReactNode;
  title?: string;
  indicator?: React.ReactElement | string;
  description?: React.ReactElement | string;
  skipHorizontalPadding?: boolean;
  skipHorizontalContentPadding?: boolean;
}
