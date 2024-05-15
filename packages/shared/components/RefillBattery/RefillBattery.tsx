import {
  BatteryState,
  calculateAvailableNumOfTransactions,
  getBatteryState,
} from '../../utils/battery';

import { memo } from 'react';
import { useBatteryBalance } from '../../query/hooks/useBatteryBalance';
import {
  AnimatedBatteryIcon,
  AnimatedBatterySize,
  Icon,
  Spacer,
  Steezy,
  Text,
  TouchableOpacity,
  View,
} from '@tonkeeper/uikit';
import { RefillBatteryIAP } from './RefillBatteryIAP';
import { t } from '@tonkeeper/shared/i18n';
import { config } from '@tonkeeper/mobile/src/config';
import { RechargeMethods } from './RechargeMethods';
import { RestorePurchases } from './RestorePurchases';
import { RefillBatterySettingsWidget } from './RefillBatterySettingsWidget';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tag } from '@tonkeeper/mobile/src/uikit';

export interface RefillBatteryProps {
  navigateToTransactions: () => void;
}

export const RefillBattery = memo<RefillBatteryProps>((props) => {
  const { balance } = useBatteryBalance();
  const batteryState = getBatteryState(balance ?? '0');
  const availableNumOfTransactionsCount = calculateAvailableNumOfTransactions(
    balance ?? '0',
  );
  const bottomInsets = useSafeAreaInsets().bottom;

  const isInAppPurchasesDisabled = config.get('disable_battery_iap_module');
  const isCryptoRechargeDisabled = config.get('disable_battery_crypto_recharge_module');

  return (
    <Animated.ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: bottomInsets + 16 }}
    >
      <View style={styles.contentContainer}>
        <View style={styles.animatedBatteryContainer}>
          <AnimatedBatteryIcon
            progress={parseFloat(balance)}
            size={AnimatedBatterySize.Large}
            empty={batteryState === BatteryState.Empty}
            emptyAccent
          />
        </View>
        <Spacer y={16} />
        {config.get('battery_beta') && (
          <>
            <Tag withLeftSpacing={false} type="warning">
              Beta
            </Tag>
            <Spacer y={4} />
          </>
        )}
        <Text textAlign="center" type="h2">
          {t(`battery.title`)}
        </Text>
        <Text textAlign="center" type="body2" color="textSecondary">
          {t(
            `battery.description.${
              batteryState === BatteryState.Empty ? 'empty' : 'other'
            }`,
            {
              count: availableNumOfTransactionsCount.toNumber(),
            },
          )}
        </Text>
        {batteryState === BatteryState.Empty && (
          <TouchableOpacity onPress={props.navigateToTransactions}>
            <Text textAlign="center" type="body2" color="textAccent">
              {t('battery.transactions.supported')}
            </Text>
          </TouchableOpacity>
        )}
        <Spacer y={32} />
      </View>
      {batteryState !== BatteryState.Empty && (
        <RefillBatterySettingsWidget onPress={props.navigateToTransactions} />
      )}
      <View style={styles.indent}>
        {!isInAppPurchasesDisabled ? <RefillBatteryIAP /> : null}
        {!isCryptoRechargeDisabled ? <RechargeMethods /> : null}
        <RestorePurchases />
      </View>
    </Animated.ScrollView>
  );
});

export const styles = Steezy.create({
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  indent: {
    paddingHorizontal: 16,
  },
  animatedBatteryContainer: {
    paddingHorizontal: 30,
    paddingTop: 6,
    paddingBottom: 8,
  },
});
