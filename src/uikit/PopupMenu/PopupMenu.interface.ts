import React, { ReactNode } from 'react';

export interface PopupMenuProps {
  marginTop?: number;
  children: React.ReactElement;
  items: ReactNode[];
}

export interface PopupMenuItemProps {
  onPress?: () => void;
  text: ReactNode;
  icon: ReactNode;
}
