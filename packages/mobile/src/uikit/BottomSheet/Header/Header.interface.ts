import { ReactNode } from 'react';

export interface HeaderProps {
  onClose(): void;
  title: string | ReactNode;
  skipDismissButton?: boolean;
}
