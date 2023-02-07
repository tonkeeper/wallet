import { createSlice } from '@reduxjs/toolkit';

import { RootState } from '$store/rootReducer';
import { ExchangeState, SetLoadedMethodsAction } from '$store/exchange/interface';

const initialState: ExchangeState = {
  isLoading: true,
  categories: [],
  methodInfo: {},
};

export const { actions, reducer } = createSlice({
  name: 'exchange',
  initialState,
  reducers: {
    loadMethods(state) {
      if (!state.categories.length) {
        state.isLoading = true;
      }
    },
    setLoadedMethods(state, action: SetLoadedMethodsAction) {
      state.isLoading = false;
      state.categories = action.payload.categories;
      state.methodInfo = {
        ...state.methodInfo,
        ...action.payload.methods,
      };
    },
    reset() {
      return initialState;
    },
  },
});

export { reducer as exchangeReducer, actions as exchangeActions };

export const exchangeSelector = (state: RootState) => state.exchange;
