import { PayloadAction } from '@reduxjs/toolkit';

export type RatesMap = { [index: string]: string };
export type ChartPoint = { x: number; y: number };

export interface RatesState {
  rates: RatesMap;
  yesterdayRates: RatesMap;
  charts: { [index: string]: ChartPoint[] };
}

export type SetRatesAction = PayloadAction<RatesMap>;
export type SetTonChartAction = PayloadAction<ChartPoint[]>;
export type LoadRatesAction = PayloadAction<{ onlyCache: boolean }>;
