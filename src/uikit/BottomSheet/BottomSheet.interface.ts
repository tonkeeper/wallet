import { ReactNode } from 'react';

export interface BottomSheetProps {
  children?: ReactNode;
  triggerClose?: any;
  usePopAction?: boolean;
  title?: string | ReactNode;
  skipCheckSnapPoints?: boolean;
  skipHeader?: boolean;
  skipDismissButton?: boolean;
  indentBottom?: boolean;
  onOpened?: () => void;
  onCloseEnd?: () => void;
  onClosePress?: () => void;
}

export type BottomSheetRef = {
  close: (onDone?: () => void) => void;
};
