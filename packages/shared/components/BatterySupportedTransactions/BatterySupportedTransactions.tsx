import React, { memo, useCallback } from 'react';
import { List, Steezy, Switch, Text, View } from '@tonkeeper/uikit';
import BigNumber from 'bignumber.js';
import { config } from '@tonkeeper/mobile/src/config';
import { t } from '@tonkeeper/shared/i18n';
import { capitalizeFirstLetter } from '../../utils/date';
import { useExternalState } from '../../hooks/useExternalState';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { BatterySupportedTransaction } from '@tonkeeper/mobile/src/wallet/managers/BatteryManager';
import { Platform } from 'react-native';

export interface SupportedTransaction {
  type: BatterySupportedTransaction;
  name: string;
  nameSingle: string;
}

export const supportedTransactions: SupportedTransaction[] = [
  {
    type: BatterySupportedTransaction.Swap,
    name: 'battery.transactions.types.swap',
    nameSingle: 'battery.transactions.type.swap',
  },
  {
    type: BatterySupportedTransaction.NFT,
    name: 'battery.transactions.types.nft',
    nameSingle: 'battery.transactions.type.transfer',
  },
  {
    type: BatterySupportedTransaction.Jetton,
    name: 'battery.transactions.types.jetton',
    nameSingle: 'battery.transactions.type.transfer',
  },
];

const calculateChargesAmount = (transactionCost: string, chargeCost: string) =>
  new BigNumber(transactionCost).div(chargeCost).decimalPlaces(0).toNumber();

export interface BatterySupportedTransactionsProps {
  editable?: boolean;
}

export const BatterySupportedTransactions = memo<BatterySupportedTransactionsProps>(
  (props) => {
    const supportedTransactionsValues = useExternalState(
      tk.wallet.battery.state,
      (state) => state.supportedTransactions,
    );

    const handleSwitchSupport = useCallback(
      (transactionType: BatterySupportedTransaction) => (supported: boolean) => {
        tk.wallet.battery.setSupportedTransaction(transactionType, supported);
      },
      [],
    );

    return (
      <View>
        {props.editable && (
          <View style={styles.textContainer}>
            <Text textAlign="center" type="h2">
              {t('battery.transactions.settings')}
            </Text>
            <Text textAlign="center" color="textSecondary" type="body2">
              {t('battery.transactions.description')}
            </Text>
          </View>
        )}
        <List>
          {supportedTransactions.map((transaction) => (
            <List.Item
              key={transaction.type}
              disabled={!props.editable}
              onPress={() =>
                handleSwitchSupport(transaction.type)(
                  !supportedTransactionsValues[transaction.type],
                )
              }
              title={capitalizeFirstLetter(t(transaction.name))}
              subtitle={t('battery.transactions.charges_per_action', {
                count: calculateChargesAmount(
                  config.get(`batteryMeanPrice_${transaction.type}`),
                  config.get('batteryMeanFees'),
                ),
                transactionName: t(transaction.nameSingle),
              })}
              rightContent={
                props.editable ? (
                  <Switch
                    disabled={Platform.OS === 'android'} // Temp fix. Should refactor screen with react-native-pager-view
                    onChange={handleSwitchSupport(transaction.type)}
                    value={supportedTransactionsValues[transaction.type]}
                  />
                ) : null
              }
            />
          ))}
        </List>
      </View>
    );
  },
);

const styles = Steezy.create({
  textContainer: {
    paddingHorizontal: 32,
    marginBottom: 32,
  },
});
