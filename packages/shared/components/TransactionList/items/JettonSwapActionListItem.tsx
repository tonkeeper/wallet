import { TransactionEvent, JettonSwapActionData, Address } from '@tonkeeper/core';
import { formatTransactionTime } from '../../../utils/date';
import { ActionListItem } from '../ActionListItem';
import { View, StyleSheet } from 'react-native';
import { formatter } from '../../../formatter';
import { Text } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo } from 'react';

interface JettonSwapActionListItemProps {
  action: JettonSwapActionData;
  event: TransactionEvent;
}

export const JettonSwapActionListItem = memo<JettonSwapActionListItemProps>((props) => {
  const { action, event } = props;

  const subtitle = action.user_wallet.name
    ? action.user_wallet.name
    : Address.parse(action.user_wallet.address).toShort();

  const amountIn = formatter.formatNano(action.amount_in, {
    decimals: action.jetton_master_in.decimals,
    postfix: action.jetton_master_in.symbol,
    prefix: '+',
  });

  const amountOut = formatter.formatNano(action.amount_out, {
    decimals: action.jetton_master_out.decimals,
    postfix: action.jetton_master_out.symbol,
    prefix: '−',
  });

  const subvalue = (
    <View>
      <Text type="label1" style={styles.amountOut}>
        {amountOut}
      </Text>
      <Text style={styles.timeText} type="body2" color="textSecondary">
        {formatTransactionTime(new Date(event.timestamp * 1000))}
      </Text>
    </View>
  );

  return (
    <ActionListItem
      icon="ic-swap-horizontal-alternative-28"
      title={t('transactions.swap')}
      subtitle={subtitle}
      subvalue={subvalue}
      value={amountIn}
      action={action}
      event={event}
      isReceive
    />
  );
});

const styles = StyleSheet.create({
  timeText: {
    textAlign: 'right',
  },
  amountOut: {
    textAlign: 'right',
    marginTop: -3,
    marginBottom: -1.5,
  },
});
