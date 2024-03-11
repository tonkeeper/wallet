import React, { memo } from 'react';
import { useBatteryBalance } from '../../query/hooks/useBatteryBalance';
import { Icon, IconNames, TouchableOpacity } from '@tonkeeper/uikit';
import { BatteryState, getBatteryState } from '../../utils/battery';
import { openRefillBatteryModal } from '../../modals/RefillBatteryModal';
import { config } from '@tonkeeper/mobile/src/config';

const iconNames: { [key: string]: IconNames } = {
  [BatteryState.Empty]: 'ic-empty-battery-28',
  [BatteryState.AlmostEmpty]: 'ic-empty-battery-28',
  [BatteryState.Medium]: 'ic-almost-empty-battery-28',
  [BatteryState.Full]: 'ic-full-battery-28',
};

const hitSlop = { top: 8, bottom: 8, right: 8, left: 8 };

export const BatteryIcon = memo(() => {
  const { balance } = useBatteryBalance();
  if (!balance || balance === '0' || config.get('disable_battery')) return null;

  const iconName = iconNames[getBatteryState(balance)];

  return (
    <TouchableOpacity onPress={openRefillBatteryModal} hitSlop={hitSlop}>
      <Icon colorless name={iconName} />
    </TouchableOpacity>
  );
});
