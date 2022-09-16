import { ReactNode } from 'react';
import { SubscriptionModel } from '$store/models';

export type InfoRows = {
  label: ReactNode;
  value?: ReactNode;
  preparedValue?: ReactNode;
}[];

export interface ActionBaseProps {
  comment?: string;
  jettonAddress?: string;
  recipientAddress?: string;
  infoRows: InfoRows;
  head?: ReactNode;
  subscriptionInfo?: SubscriptionModel;
  isInProgress: boolean;
  isSpam: boolean;
  label: string;
  sentLabel: string;
  shouldShowSendToRecipientButton: boolean;
  shouldShowOpenSubscriptionButton: boolean;
}
