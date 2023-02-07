import { PayloadAction } from '@reduxjs/toolkit';

import { BuyTransactionModel, EventModel } from '$store/models';

export type EventsMap = { [index: string]: EventModel };
export type EventKey = string;

export interface EventsState {
  isLoading: boolean;
  eventsInfo: EventsMap;
  canLoadMore: boolean;
}

export type LoadEventsAction = PayloadAction<{
  isLoadMore?: boolean;
  isReplace?: boolean;
  isSilent?: boolean;
  ignoreCache?: boolean;
}>;
export type SetEventsAction = PayloadAction<{
  events: EventModel[];
  isReplace: boolean;
  isFromCache?: boolean;
}>;
export type SetCanLoadMoreAction = PayloadAction<boolean>;
export type RemoveEventsAction = PayloadAction<string[]>;
export type UpdateEventAction = PayloadAction<{
  eventId: string;
  updated: Pick<EventModel, any>;
}>;
export type PollEventsAction = PayloadAction<undefined>;
export type CancelPollEventsAction = PayloadAction<undefined>;
export type ReloadBuyTransactionsStatusAction = PayloadAction<BuyTransactionModel[]>;