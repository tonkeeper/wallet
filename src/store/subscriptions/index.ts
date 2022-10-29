import { createSelector, createSlice } from '@reduxjs/toolkit';

import { RootState } from '$store/rootReducer';
import {
  SetSubscriptionsInfoAction,
  SubscribeAction,
  SubscriptionsState,
  UnsubscribeAction,
} from '$store/subscriptions/interface';

const initialState: SubscriptionsState = {
  subscriptionsInfo: {},
};

export const { actions, reducer } = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    loadSubscriptions() {},
    setSubscriptionsInfo(state, action: SetSubscriptionsInfoAction) {
      state.subscriptionsInfo = {
        ...state.subscriptionsInfo,
        ...action.payload,
      };
    },
    subscribe(_, __: SubscribeAction) {},
    unsubscribe(_, __: UnsubscribeAction) {},
    reset() {
      return initialState;
    },
  },
});

export { reducer as subscriptionsReducer, actions as subscriptionsActions };

export const subscriptionsSelector = (state: RootState) => state.subscriptions;
export const subscriptionsInfoSelector = createSelector(
  subscriptionsSelector,
  (subscriptionsState) => subscriptionsState.subscriptionsInfo,
);
export const hasSubscriptionsSelector = createSelector(
  subscriptionsInfoSelector,
  (subscriptionsInfo) => Object.values(subscriptionsInfo).length > 0,
);
