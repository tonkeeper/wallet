import { ReactNode } from 'react';
import { TonThemeColor } from '$styled';
import { AccountAddress, EncryptedComment } from '@tonkeeper/core';

export interface ActionItemBaseProps {
  actionKey: string;
  comment: string;
  encryptedComment?: EncryptedComment;
  decryptedComment?: string;
  sender?: AccountAddress;
  isInProgress: boolean;
  borderStart?: boolean;
  borderEnd?: boolean;
  label: string;
  typeLabel: string;
  type: string;
  infoRows: { label?: ReactNode; value?: ReactNode }[];
  labelColor?: TonThemeColor;
  currency?: string;
  bottomContent?: ReactNode;
  isSpam?: boolean;
  handleOpenAction?: () => void;
  handleDecryptComment?: () => void;
}
