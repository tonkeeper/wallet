import React from 'react';

export interface FormItemProps {
  title?: string;
  indicator?: React.ReactElement | string;
  description?: React.ReactElement | string;
  skipHorizontalPadding?: boolean;
  skipHorizontalContentPadding?: boolean;
}
