import React, { memo } from 'react';
import { Icon, IconNames, List, Radio, Steezy, View } from '@tonkeeper/uikit';
import { formatter } from '$utils/formatter';
import { t } from '@tonkeeper/shared/i18n';
import BigNumber from 'bignumber.js';
import { config } from '$config';
import { IRechargeMethod } from '$core/BatterySend/hooks/useRechargeMethod';
import { Text } from '$uikit';

export interface BatteryPackItemProps {
  icon: IconNames;
  tonAmount: string;
  onAmountSelect: (selectedAmount: undefined | number) => () => void;
  rechargeMethod: IRechargeMethod;
  isManualAmountInput: boolean;
  inputtedAmount: string;
  shouldMinusReservedAmount: boolean;
}

export const BatteryPackItem = memo<BatteryPackItemProps>((props) => {
  const amountInToken = props.rechargeMethod.fromTon(props.tonAmount);

  const isEnoughBalance = new BigNumber(amountInToken).isLessThan(
    props.rechargeMethod.balance,
  );

  return (
    <List.Item
      disabled={!isEnoughBalance}
      onPress={props.onAmountSelect(amountInToken)}
      rightContent={
        <Radio
          disabled={!isEnoughBalance}
          onSelect={() => null}
          isSelected={
            !props.isManualAmountInput &&
            formatter.format(amountInToken, {
              decimals: props.rechargeMethod.decimals,
            }) === props.inputtedAmount
          }
        />
      }
      title={t('battery.description.other', {
        count: new BigNumber(amountInToken)
          .minus(
            props.shouldMinusReservedAmount ? props.rechargeMethod.minInputAmount : 0,
          )
          .multipliedBy(props.rechargeMethod.rate)
          .div(config.get('batteryMeanFees'))
          .decimalPlaces(0)
          .toNumber(),
      })}
      subtitle={
        <View style={styles.subtitleContainer}>
          <Text variant="body2" color="textSecondary">
            {formatter.format(amountInToken, {
              currency: props.rechargeMethod.symbol,
            })}
            <Text variant="body2" color="textTertiary">
              {' '}·{' '}
            </Text>
            {props.rechargeMethod.formattedTonFiatAmount(props.tonAmount)}
          </Text>
        </View>
      }
      leftContent={
        <Icon
          style={styles.listItemIcon.static}
          imageStyle={styles.listItemIcon.static}
          colorless
          name={props.icon}
        />
      }
    />
  );
});

const styles = Steezy.create({
  listItemIcon: {
    width: 26,
    height: 44,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
