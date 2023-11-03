import {
  BatteryState,
  calculateAvailableNumOfTransactions,
  getBatteryState,
} from '../../utils/battery';

import { memo } from 'react';
import { useBatteryBalance } from '../../query/hooks/useBatteryBalance';
import {
  Button,
  Icon,
  IconNames,
  Modal,
  Spacer,
  Steezy,
  Text,
  View,
} from '@tonkeeper/uikit';
import { navigation, SheetActions, useNavigation } from '@tonkeeper/router';
import { RefillBatteryIAP } from './RefillBatteryIAP';
import { t } from '@tonkeeper/shared/i18n';
import { config } from '../../config';

const iconNames: { [key: string]: IconNames } = {
  [BatteryState.Empty]: 'ic-empty-battery-128',
  [BatteryState.AlmostEmpty]: 'ic-empty-battery-128',
  [BatteryState.Medium]: 'ic-almost-empty-battery-128',
  [BatteryState.Full]: 'ic-full-battery-128',
};

export const RefillBatteryModal = memo(() => {
  const { data: balance } = useBatteryBalance();
  const batteryState = getBatteryState(balance ?? '0');
  const iconName = iconNames[batteryState];
  const nav = useNavigation();

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content>
        <View style={styles.contentContainer}>
          <Icon colorless name={iconName} />
          <Spacer y={24} />
          <Text textAlign="center" type="h2">
            {t(`battery.title.${batteryState.toLowerCase()}`)}
          </Text>
          <Spacer y={4} />
          <Text textAlign="center" type="body2" color="textSecondary">
            {t(`battery.description.${batteryState.toLowerCase()}`, {
              cnt: calculateAvailableNumOfTransactions(balance ?? '0'),
            })}
          </Text>
          <Spacer y={16} />
        </View>
        {config.get('disable_battery_iap_module') ? (
          <Button title={t('battery.ok')} onPress={nav.goBack} />
        ) : (
          <RefillBatteryIAP />
        )}
      </Modal.Content>
      <Modal.Footer />
    </Modal>
  );
});

export function openRefillBatteryModal() {
  navigation.push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: RefillBatteryModal,
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
});
