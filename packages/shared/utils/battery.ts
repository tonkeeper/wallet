import BigNumber from 'bignumber.js';
import { formatter } from '../formatter';

export enum BatteryState {
  Full = 'FULL',
  Medium = 'MEDIUM',
  AlmostEmpty = 'ALMOST_EMPTY',
  Empty = 'EMPTY',
}

const valuesForBatteryState = {
  [BatteryState.Medium]: '1',
  [BatteryState.AlmostEmpty]: '0.1',
};

export const MEAN_FEES = '0.01';

export function getBatteryState(batteryBalance: string) {
  const balance = new BigNumber(formatter.fromNano(batteryBalance));
  const medium = new BigNumber(valuesForBatteryState[BatteryState.AlmostEmpty]);
  const empty = new BigNumber(valuesForBatteryState[BatteryState.Empty]);

  if (balance.gte(medium)) {
    return BatteryState.Full;
  }

  if (balance.gte(empty)) {
    return BatteryState.Medium;
  }

  if (balance.gt(0)) {
    return BatteryState.AlmostEmpty;
  }

  return BatteryState.Empty;
}

export function calculateAvailableNumOfTransactions(batteryBalance: string) {
  const balance = new BigNumber(formatter.fromNano(batteryBalance));

  // return balance divided by mean fees rounded down to nearest 10
  return balance
    .div(MEAN_FEES)
    .decimalPlaces(0, BigNumber.ROUND_DOWN)
    .div(10)
    .decimalPlaces(0, BigNumber.ROUND_DOWN)
    .times(10)
    .toString();
}
