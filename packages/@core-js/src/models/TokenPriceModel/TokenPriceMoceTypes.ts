export enum PriceTrend {
  Negative = 'Negative',
  Positive = 'Positive',
  Unknown = 'Unknown',
}

export type TokenRate = {
  percent: string;
  trend: PriceTrend;
};

export type TokenPrice = {
  diff_24h: TokenRate;
  value: string;
};
