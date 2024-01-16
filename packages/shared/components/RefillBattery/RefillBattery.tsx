import {
  BatteryState,
  calculateAvailableNumOfTransactions,
  getBatteryState,
} from '../../utils/battery';

import { memo } from 'react';
import { useBatteryBalance } from '../../query/hooks/useBatteryBalance';
import { Icon, IconNames, Spacer, Steezy, Text, View } from '@tonkeeper/uikit';
import { navigation, SheetActions } from '@tonkeeper/router';
import { RefillBatteryIAP } from './RefillBatteryIAP';
import { t } from '@tonkeeper/shared/i18n';
import { config } from '../../config';
import { RechargeByPromoButton } from './RechargeByPromoButton';

const iconNames: { [key: string]: IconNames } = {
  [BatteryState.Empty]: 'ic-empty-battery-128',
  [BatteryState.AlmostEmpty]: 'ic-empty-battery-128',
  [BatteryState.Medium]: 'ic-almost-empty-battery-128',
  [BatteryState.Full]: 'ic-full-battery-128',
};

export const RefillBattery = memo(() => {
  const { data: balance } = useBatteryBalance();
  const batteryState = getBatteryState(balance ?? '0');
  const iconName = iconNames[batteryState];

  const isInAppPurchasesDisabled = config.get('disable_battery_iap_module');

  return (
    <>
      <View style={styles.contentContainer}>
        <Icon colorless name={iconName} />
        <Spacer y={24} />
        <Text textAlign="center" type="h2">
          {t(`battery.title.${batteryState.toLowerCase()}`)}
        </Text>
        <Spacer y={4} />
        <Text textAlign="center" type="body2" color="textSecondary">
          {t(
            `battery.description.${
              batteryState === BatteryState.Empty ? 'empty' : 'other'
            }`,
            {
              cnt: calculateAvailableNumOfTransactions(balance ?? '0'),
            },
          )}
        </Text>
        <Spacer y={16} />
      </View>
      <View style={styles.indent}>
        {!isInAppPurchasesDisabled ? <RefillBatteryIAP /> : null}
        <RechargeByPromoButton />
        <Spacer y={16} />
        {!isInAppPurchasesDisabled && (
          <Text type="label2" textAlign="center" color="textTertiary">
            {t('battery.packages.disclaimer')}
          </Text>
        )}
      </View>
    </>
  );
});

export function openRefillBatteryModal() {
  navigation.push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: RefillBattery,
    path: '/refill-battery',
  });
}

export const styles = Steezy.create({
  contentContainer: {
    paddingTop: 48,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  indent: {
    paddingHorizontal: 16,
  },
});
