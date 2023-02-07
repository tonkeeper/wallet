import { createSelector, createSlice } from '@reduxjs/toolkit';

import { RootState } from '$store/rootReducer';
import {
  LoadEventsAction,
  SetEventsAction,
  EventsMap,
  UpdateEventAction,
  SetCanLoadMoreAction,
  RemoveEventsAction,
  EventsState,
  PollEventsAction,
  CancelPollEventsAction,
} from './interface';

const initialState: EventsState = {
  isLoading: false,
  eventsInfo: {},
  canLoadMore: false,
};

export const { actions, reducer } = createSlice({
  name: 'events',
  initialState,
  reducers: {
    loadEvents(state, action: LoadEventsAction) {
      state.isLoading = !action.payload.isSilent;
    },
    setEvents(state, action: SetEventsAction) {
      const infoMap: EventsMap = action.payload.isReplace ? {} : { ...state.eventsInfo };
      for (let item of action.payload.events) {
        infoMap[item.eventId] = item;
      }

      state.eventsInfo = {
        ...infoMap,
      };

      if (!action.payload.isFromCache) {
        state.isLoading = false;
      }
    },
    updateEvent(state, action: UpdateEventAction) {
      const { eventId, updated } = action.payload;

      if (state.eventsInfo[eventId]) {
        state.eventsInfo[eventId] = {
          ...state.eventsInfo[eventId],
          ...updated,
        };
      }
    },
    removeEvents(state, action: RemoveEventsAction) {
      const copy = { ...state.eventsInfo };
      for (let id of action.payload) {
        delete copy[id];
      }
      state.eventsInfo = copy;
    },
    setCanLoadMore(state, action: SetCanLoadMoreAction) {
      state.canLoadMore = action.payload;
    },
    resetEvents() {
      return initialState;
    },
    pollEvents(_, __: PollEventsAction) {},
    cancelPollEvents(_, __: CancelPollEventsAction) {},
  },
});

export { reducer as eventsReducer, actions as eventsActions };

export const eventsSelector = (state: RootState) => state.events;
export const eventsEventsInfoSelector = createSelector(
  eventsSelector,
  (state) => state.eventsInfo,
);
