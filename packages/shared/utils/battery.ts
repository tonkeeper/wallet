import BigNumber from 'bignumber.js';
import { formatter } from '../formatter';

export enum BatteryState {
  Full = 'FULL',
  AlmostEmpty = 'ALMOST_EMPTY',
  Empty = 'EMPTY',
}

const valuesForBatteryState = {
  [BatteryState.AlmostEmpty]: '1',
  [BatteryState.Empty]: '0.1',
};

export function getBatteryState(batteryBalance: string) {
  const balance = new BigNumber(formatter.fromNano(batteryBalance));
  const almostEmpty = new BigNumber(valuesForBatteryState[BatteryState.AlmostEmpty]);
  const empty = new BigNumber(valuesForBatteryState[BatteryState.Empty]);

  if (balance.isGreaterThan(almostEmpty)) {
    return BatteryState.Full;
  }

  if (balance.isGreaterThan(empty)) {
    return BatteryState.AlmostEmpty;
  }

  return BatteryState.Empty;
}
