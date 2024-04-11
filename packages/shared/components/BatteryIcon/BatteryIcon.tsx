import React, { memo } from 'react';
import { useBatteryBalance } from '../../query/hooks/useBatteryBalance';
import {
  AnimatedBatteryIcon,
  AnimatedBatterySize,
  Icon,
  Steezy,
  TouchableOpacity,
} from '@tonkeeper/uikit';
import { BatteryState, getBatteryState } from '../../utils/battery';
import { config } from '@tonkeeper/mobile/src/config';
import { useBatteryUIStore } from '@tonkeeper/mobile/src/store/zustand/batteryUI';
import { openRefillBatteryModal } from '@tonkeeper/mobile/src/navigation';

const hitSlop = { top: 12, bottom: 12, right: 24, left: 8 };

export const BatteryIcon = memo(() => {
  const { balance } = useBatteryBalance();
  const isViewedBatteryScreen = useBatteryUIStore((state) => state.isViewedBatteryScreen);
  if (config.get('disable_battery')) return null;

  return (
    <TouchableOpacity onPress={openRefillBatteryModal} hitSlop={hitSlop}>
      {getBatteryState(balance) === BatteryState.Empty ? (
        <Icon
          imageStyle={styles.iconSize.static}
          style={styles.iconSize.static}
          colorless
          name={
            isViewedBatteryScreen
              ? 'ic-empty-battery-flash-34'
              : 'ic-empty-battery-accent-flash-34'
          }
        />
      ) : (
        <AnimatedBatteryIcon
          progress={parseFloat(balance)}
          size={AnimatedBatterySize.Small}
        />
      )}
    </TouchableOpacity>
  );
});

const styles = Steezy.create({
  iconSize: {
    width: 20,
    height: 34,
  },
});
