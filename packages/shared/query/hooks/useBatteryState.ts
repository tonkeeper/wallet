import { useBatteryBalance } from './useBatteryBalance';
import { getBatteryState } from '../../utils/battery';

export const useBatteryState = () => {
  const { balance } = useBatteryBalance();
  return getBatteryState(balance ?? '0');
};
