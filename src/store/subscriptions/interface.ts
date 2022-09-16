import { SubscriptionModel } from '$store/models';
import { PayloadAction } from '@reduxjs/toolkit';

export type SubscriptionsInfo = { [index: string]: SubscriptionModel };

export interface SubscriptionsState {
  subscriptionsInfo: SubscriptionsInfo;
}

export type SetSubscriptionsInfoAction = PayloadAction<SubscriptionsInfo>;

export type SubscribeAction = PayloadAction<{
  subscription: SubscriptionModel;
  onDone: () => void;
  onFail: () => void;
}>;
export type UnsubscribeAction = PayloadAction<{
  subscription: SubscriptionModel;
  onDone: () => void;
  onFail: () => void;
}>;
export type SendToServerAction = PayloadAction<{ seqno: number }>;
export type CheckSubscriptionAction = PayloadAction<SubscriptionModel>;
