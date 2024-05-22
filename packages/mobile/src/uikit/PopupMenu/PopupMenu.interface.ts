import React, { ReactNode } from 'react';

export interface PopupMenuProps {
  children: React.ReactElement;
  items: ReactNode[];
  width?: number;
}

export interface PopupMenuItemProps {
  onPress?: () => void;
  text: ReactNode;
  icon: ReactNode;
  waitForAnimationEnd?: boolean;
  onCloseMenu?: () => void;
  /**
   * If true, press event of PopupMenuItem closes PopupMenu
   */
  shouldCloseMenu?: boolean;
}
