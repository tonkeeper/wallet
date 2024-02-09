import { createSlice } from '@reduxjs/toolkit';

import { SubscribeAction, UnsubscribeAction } from '$store/subscriptions/interface';

export const { actions, reducer } = createSlice({
  name: 'subscriptions',
  initialState: {},
  reducers: {
    subscribe(_, __: SubscribeAction) {},
    unsubscribe(_, __: UnsubscribeAction) {},
  },
});

export const subscriptionsActions = actions;
