import React, { memo, useMemo } from 'react';
import { List } from '@tonkeeper/uikit';
import { t } from '@tonkeeper/shared/i18n';
import { useExternalState } from '../../hooks/useExternalState';
import { tk } from '@tonkeeper/mobile/src/wallet';

export interface RefillBatterySettingsWidgetProps {
  onPress: () => void;
}

export const RefillBatterySettingsWidget = memo<RefillBatterySettingsWidgetProps>(
  (props) => {
    const enabledTransactions = useExternalState(
      tk.wallet.battery.state,
      (state) => state.supportedTransactions,
    );

    const enabledTransactionsNames = useMemo(() => {
      return Object.entries(enabledTransactions)
        .filter(([, enabled]) => enabled)
        .map(([type]) => t(`battery.transactions.types.${type}`))
        .join(', ');
    }, [enabledTransactions]);

    return (
      <List>
        <List.Item
          onPress={props.onPress}
          chevron
          title={t('battery.transactions.settings')}
          subtitle={t('battery.transactions.will_be_paid', {
            enabledTransactions: enabledTransactionsNames,
          })}
          subtitleNumberOfLines={2}
        />
      </List>
    );
  },
);
