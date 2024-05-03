import React, { memo } from 'react';
import { useBatteryBalance } from '../../query/hooks/useBatteryBalance';
import {
  AnimatedBatteryIcon,
  AnimatedBatterySize,
  Icon,
  Spacer,
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
  if (config.get('disable_battery')) {
    return null;
  }

  // Hide battery icon if it's empty and beta is enabled
  if (config.get('battery_beta') && (!balance || balance === '0')) {
    return null;
  }

  return (
    <>
      <TouchableOpacity onPress={openRefillBatteryModal} hitSlop={hitSlop}>
        <AnimatedBatteryIcon
          progress={parseFloat(balance)}
          size={AnimatedBatterySize.Small}
          empty={getBatteryState(balance) === BatteryState.Empty}
          emptyAccent={!isViewedBatteryScreen}
        />
      </TouchableOpacity>
    </>
  );
});

const styles = Steezy.create({
  iconSize: {
    width: 20,
    height: 34,
  },
});
