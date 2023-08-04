import { ReactNode } from 'react';
import { SubscriptionModel } from '$store/models';
import { EncryptedComment } from '@tonkeeper/core';

export type InfoRows = {
  label: ReactNode;
  value?: ReactNode;
  subvalue?: ReactNode;
  preparedValue?: ReactNode;
}[];

export interface ActionBaseProps {
  comment?: string;
  encryptedComment?: EncryptedComment;
  decryptedComment?: string;
  eventId: string;
  jettonAddress?: string;
  recipientAddress?: string;
  infoRows: InfoRows;
  head?: ReactNode;
  isFailed?: boolean;
  subscriptionInfo?: SubscriptionModel;
  isInProgress: boolean;
  isSpam: boolean;
  label: string;
  sentLabel: string;
  shouldShowSendToRecipientButton: boolean;
  shouldShowOpenSubscriptionButton: boolean;
  fiatValue?: string;
  handleDecryptComment?: () => void;
}
