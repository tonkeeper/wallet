import React, { memo } from 'react';
import { useBatteryBalance } from '../../query/hooks/useBatteryBalance';
import { Icon, IconNames, Steezy, TouchableOpacity } from '@tonkeeper/uikit';
import { BatteryState, getBatteryState } from '../../utils/battery';
import { openRefillBatteryModal } from '../../modals/RefillBatteryModal';
import { config } from '@tonkeeper/mobile/src/config';
import { useBatteryUIStore } from '@tonkeeper/mobile/src/store/zustand/batteryUI';

const iconNames: { [key: string]: ((isViewed: boolean) => IconNames) | IconNames } = {
  [BatteryState.Empty]: (isViewed) =>
    isViewed ? 'ic-empty-battery-flash-34' : 'ic-empty-battery-accent-flash-34',
  [BatteryState.AlmostEmpty]: 'ic-almost-empty-battery-34',
  [BatteryState.Medium]: 'ic-medium-battery-34',
  [BatteryState.Full]: 'ic-full-battery-34',
};

const hitSlop = { top: 8, bottom: 8, right: 8, left: 8 };

export const BatteryIcon = memo(() => {
  const { balance } = useBatteryBalance();
  const isViewedBatteryScreen = useBatteryUIStore((state) => state.isViewedBatteryScreen);
  if (config.get('disable_battery')) return null;

  const iconName = iconNames[getBatteryState(balance)];

  return (
    <TouchableOpacity onPress={openRefillBatteryModal} hitSlop={hitSlop}>
      <Icon
        imageStyle={styles.iconSize.static}
        style={styles.iconSize.static}
        colorless
        name={typeof iconName === 'string' ? iconName : iconName(isViewedBatteryScreen)}
      />
    </TouchableOpacity>
  );
});

const styles = Steezy.create({
  iconSize: {
    width: 20,
    height: 34,
  },
});
