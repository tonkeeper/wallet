import React, { memo, useMemo } from 'react';
import { useBatteryState } from '@tonkeeper/shared/query/hooks/useBatteryState';
import { Icon, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { t } from '@tonkeeper/shared/i18n';
import { BatteryState } from '@tonkeeper/shared/utils/battery';

export interface SendScreenBatteryWidgetProps {
  isSendingWithBattery: boolean;
}

export const SendScreenBatteryWidget = memo<SendScreenBatteryWidgetProps>((props) => {
  const batteryState = useBatteryState();

  const content = useMemo(() => {
    if (props.isSendingWithBattery && batteryState === BatteryState.AlmostEmpty) {
      return (
        <>
          <Text color="textSecondary" type="body2">
            {t('battery.send_widget.battery')}
          </Text>
          <Spacer x={8} />
          <Icon
            style={styles.iconSize.static}
            imageStyle={styles.iconSize.static}
            name={'ic-battery-almost-empty-24'}
          />
        </>
      );
    }
    return null;
  }, [batteryState, props.isSendingWithBattery]);

  return <View style={styles.container}>{content}</View>;
});

const styles = Steezy.create({
  container: {
    paddingVertical: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconSize: {
    width: 15,
    height: 24,
  },
});
