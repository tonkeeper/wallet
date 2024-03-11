import BigNumber from 'bignumber.js';
import { config } from '@tonkeeper/mobile/src/config';

export enum BatteryState {
  Full = 'FULL',
  Medium = 'MEDIUM',
  AlmostEmpty = 'ALMOST_EMPTY',
  Empty = 'EMPTY',
}

const valuesForBatteryState = {
  [BatteryState.Medium]: '2',
  [BatteryState.AlmostEmpty]: '1',
  [BatteryState.Empty]: '0.03',
};

export const MEAN_FEES = config.get('batteryMeanFees');

export function getBatteryState(batteryBalance: string) {
  const balance = new BigNumber(batteryBalance);
  const medium = new BigNumber(valuesForBatteryState[BatteryState.Medium]);
  const almostEmpty = new BigNumber(valuesForBatteryState[BatteryState.AlmostEmpty]);
  const empty = new BigNumber(valuesForBatteryState[BatteryState.Empty]);

  if (balance.gte(medium)) {
    return BatteryState.Full;
  }

  if (balance.gte(almostEmpty)) {
    return BatteryState.Medium;
  }

  if (balance.gt(empty)) {
    return BatteryState.AlmostEmpty;
  }

  return BatteryState.Empty;
}

export function calculateAvailableNumOfTransactions(batteryBalance: string) {
  const balance = new BigNumber(batteryBalance);

  // return balance divided by mean fees rounded down to nearest 10
  return balance
    .div(MEAN_FEES)
    .decimalPlaces(0, BigNumber.ROUND_DOWN)
    .div(10)
    .decimalPlaces(0, BigNumber.ROUND_DOWN)
    .times(10)
    .toNumber();
}
