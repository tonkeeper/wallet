import { useBatteryBalance } from './useBatteryBalance';
import { getBatteryState } from '../../utils/battery';

export const useBatteryState = () => {
  const { data: balance } = useBatteryBalance();
  return getBatteryState(balance ?? '0');
};
