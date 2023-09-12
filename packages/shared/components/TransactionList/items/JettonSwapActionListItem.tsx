import { ActivityEvent, JettonSwapActionData, Address } from '@tonkeeper/core';
import { ActionStatusEnum } from '@tonkeeper/core/src/TonAPI';
import { formatTransactionTime } from '../../../utils/date';
import { ActionListItem } from '../ActionListItem';
import { View, StyleSheet } from 'react-native';
import { formatter } from '../../../formatter';
import { Text } from '@tonkeeper/uikit';
import { t } from '../../../i18n';
import { memo, useMemo } from 'react';

interface JettonSwapActionListItemProps {
  action: JettonSwapActionData;
  event: ActivityEvent;
}

export const JettonSwapActionListItem = memo<JettonSwapActionListItemProps>((props) => {
  const { action, event } = props;

  const subtitle = action.user_wallet.name
    ? action.user_wallet.name
    : Address.parse(action.user_wallet.address).toShort();

  const amountIn = useMemo(() => {
    if (action.ton_in) {
      return formatter.formatNano(action.ton_in, {
        postfix: 'TON',
        prefix: '+',
      });
    } else if (action.jetton_master_in) {
      return formatter.formatNano(action.amount_in, {
        decimals: action.jetton_master_in.decimals,
        postfix: action.jetton_master_in.symbol,
        prefix: '+',
      });
    } else {
      return '-';
    }
  }, [action]);

  const amountOut = useMemo(() => {
    if (action.ton_out) {
      return formatter.formatNano(action.ton_out, {
        postfix: 'TON',
        prefix: '+',
      });
    } else if (action.jetton_master_out) {
      return formatter.formatNano(action.amount_out, {
        decimals: action.jetton_master_out.decimals,
        postfix: action.jetton_master_out.symbol,
        prefix: '−',
      });
    } else {
      return '-';
    }
  }, [action]);

  return (
    <ActionListItem
      iconName="ic-swap-horizontal-alternative-28"
      title={t('transactions.swap')}
      subtitle={subtitle}
      value={amountIn}
      action={action}
      event={event}
      greenValue
      subvalue={
        <Text type="label1" style={styles.amountOut}>
          {amountOut}
        </Text>
      }
    >
      <View style={styles.content}>
        <View style={styles.flex}>
          {action.status === ActionStatusEnum.Failed && (
            <Text type="body2" color="accentOrange">
              {t('transactions.failed')}
            </Text>
          )}
        </View>
        <View>
          <Text style={styles.timeText} type="body2" color="textSecondary">
            {formatTransactionTime(new Date(event.timestamp * 1000))}
          </Text>
        </View>
      </View>
    </ActionListItem>
  );
});

const styles = StyleSheet.create({
  timeText: {
    textAlign: 'right',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  amountOut: {
    textAlign: 'right',
    marginTop: -3,
    marginBottom: -1.5,
  },
});
