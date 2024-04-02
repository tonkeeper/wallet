import React, { memo, useCallback } from 'react';
import { List, Steezy, Switch, Text, View } from '@tonkeeper/uikit';
import BigNumber from 'bignumber.js';
import { config } from '@tonkeeper/mobile/src/config';
import { t } from '@tonkeeper/shared/i18n';
import { capitalizeFirstLetter } from '../../utils/date';
import { useExternalState } from '../../hooks/useExternalState';
import { tk } from '@tonkeeper/mobile/src/wallet';
import { BatterySupportedTransaction } from '@tonkeeper/mobile/src/wallet/managers/BatteryManager';

export interface SupportedTransaction {
  type: BatterySupportedTransaction;
  name: string;
  nameSingle: string;
  meanPrice: string;
}

export const supportedTransactions: SupportedTransaction[] = [
  {
    type: BatterySupportedTransaction.Swap,
    name: 'battery.transactions.types.swap',
    nameSingle: 'battery.transactions.type.swap',
    meanPrice: '0.22',
  },
  {
    type: BatterySupportedTransaction.NFT,
    name: 'battery.transactions.types.nft',
    nameSingle: 'battery.transactions.type.transfer',
    meanPrice: '0.025',
  },
  {
    type: BatterySupportedTransaction.Jetton,
    name: 'battery.transactions.types.jetton',
    nameSingle: 'battery.transactions.type.transfer',
    meanPrice: '0.055',
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
              disabled={!props.editable}
              onPress={() =>
                handleSwitchSupport(transaction.type)(
                  !supportedTransactionsValues[transaction.type],
                )
              }
              key={transaction.type}
              title={capitalizeFirstLetter(t(transaction.name))}
              subtitle={t('battery.transactions.charges_per_action', {
                count: calculateChargesAmount(
                  transaction.meanPrice,
                  config.get('batteryMeanFees'),
                ),
                transactionName: t(transaction.nameSingle),
              })}
              rightContent={
                props.editable && (
                  <Switch
                    onChange={handleSwitchSupport(transaction.type)}
                    value={supportedTransactionsValues[transaction.type]}
                  />
                )
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
