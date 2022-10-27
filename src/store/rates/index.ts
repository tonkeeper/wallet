import {createSelector, createSlice} from '@reduxjs/toolkit';

import { RootState } from '$store/rootReducer';
import { LoadRatesAction, RatesState, SetRatesAction, SetTonChartAction } from '$store/rates/interface';
import { CryptoCurrencies } from '$shared/constants';

const initialState: RatesState = {
  rates: {},
  yesterdayRates: {},
  charts: {},
};

export const { actions, reducer } = createSlice({
  name: 'rates',
  initialState,
  reducers: {
    loadRates(_, __: LoadRatesAction) {},
    setRates(state, action: SetRatesAction) {
      state.rates = {
        ...state.rates,
        ...action.payload,
      };
    },
    setYesterdayRates(state, action: SetRatesAction) {
      state.yesterdayRates = {
        ...state.rates,
        ...action.payload,
      };
    },
    loadTonChart() {},
    resetRates() {
      return initialState;
    },
    setTonChart(state, action: SetTonChartAction) {
      state.charts[CryptoCurrencies.Ton] = action.payload;
    },
  },
});

export { reducer as ratesReducer, actions as ratesActions };

export const ratesSelector = (state: RootState) => state.rates;
export const ratesRatesSelector = createSelector(ratesSelector, (state) => state.rates);
export const ratesChartsSelector = createSelector(ratesSelector, (state) => state.charts);
export const ratesYesterdayRatesSelector = createSelector(
  ratesSelector,
  (state) => state.yesterdayRates,
);
