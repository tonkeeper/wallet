import { AmountFormatter, AnyTransactionAction, TransactionEvent } from '@tonkeeper/core';
import { Icon, IconNames, List, Loader, Picture, Text, View } from '@tonkeeper/uikit';
import { ActionStatusEnum } from '@tonkeeper/core/src/TonAPI';
import { ListItemContent, Steezy } from '@tonkeeper/uikit';
import { formatTransactionTime } from '../../utils/date';
import { findSenderAccount } from './findSenderAccount';
import { memo, useCallback, useMemo } from 'react';
import { Address } from '../../Address';
import { t } from '../../i18n';
import { openActionDetails } from '../../modals/ActionDetailsModal';
import { formatter } from '../../formatter';

interface ActionListItem {
  onPress?: () => void;
  subvalue?: string | React.ReactNode;
  action: AnyTransactionAction;
  subtitleNumberOfLines?: number;
  children?: React.ReactNode;
  event: TransactionEvent;
  picture?: string;
  icon?: IconNames;
  title?: string;
  value?: string;
  subtitle?: string;
  greenValue?: boolean;
}

export const ActionListItem = memo<ActionListItem>((props: ActionListItem) => {
  const { event, action, children, onPress, subtitleNumberOfLines, greenValue } = props;

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      openActionDetails(`${event.event_id}`);
    }
  }, []);

  const isFailed = action.status === ActionStatusEnum.Failed;

  const senderAccount = useMemo(() => {
    return findSenderAccount(action);
  }, [action]);

  const picture = useMemo(() => {
    if (props.picture !== undefined) {
      return props.picture;
    } else if (senderAccount) {
      return senderAccount.icon;
    } else {
      return null;
    }
  }, [props.picture, senderAccount]);

  const iconName = useMemo(() => {
    if (isFailed) {
      return 'ic-exclamationmark-circle-28';
    } else if (props.icon !== undefined) {
      return props.icon;
    } else if (action.destination === 'in') {
      return 'ic-tray-arrow-down-28';
    } else if (action.destination === 'out') {
      return 'ic-tray-arrow-up-28';
    } else {
      return 'ic-gear-28';
    }
  }, [action.destination, props.icon, action.status, isFailed]);

  const title = useMemo(() => {
    if (props.title !== undefined) {
      return props.title;
    } else if (action.destination === 'in') {
      return t('transaction_type_receive');
    } else if (action.destination === 'out') {
      return t('transaction_type_sent');
    } else {
      return action.simple_preview.name;
    }
  }, [action.destination, props.title]);

  const subtitle = useMemo(() => {
    if (event.is_scam) {
      return t('transactions.spam');
    } else if (props.subtitle !== undefined) {
      return props.subtitle;
    } else if (senderAccount) {
      if (senderAccount.name) {
        return senderAccount.name;
      } else {
        return Address.parse(senderAccount.address).toShort();
      }
    } else {
      return action.simple_preview.description;
    }
  }, [action.simple_preview, event.is_scam, senderAccount, props.subtitle]);

  const value = useMemo(() => {
    if (props.value !== undefined) {
      return props.value;
    } else {
      let amountPrefix = '';
      if (action.destination === 'out') {
        amountPrefix = AmountFormatter.sign.minus;
      } else if (action.destination === 'in') {
        amountPrefix = AmountFormatter.sign.plus;
      }

      if (action.amount) {
        return formatter.formatNano(action.amount.value, {
          decimals: action.amount.decimals ?? 9,
          postfix: action.amount.symbol,
          prefix: amountPrefix,
        });
      }

      return AmountFormatter.sign.minus;
    }
  }, [action.destination, action.amount, props.value]);

  const subvalue = useMemo(() => {
    if (props.subvalue !== undefined) {
      return props.subvalue;
    } else {
      return formatTransactionTime(new Date(event.timestamp * 1000));
    }
  }, [event.timestamp, props.subvalue]);

  const valueStyle = [
    (action.destination === 'in' || greenValue) && styles.receiveValue,
    event.is_scam && styles.scamAmountText,
  ];

  const icon = (
    <ListItemContent style={styles.icon.static}>
      {picture && !isFailed ? (
        <Picture style={styles.picture} uri={picture} />
      ) : (
        <Icon name={iconName} color="iconSecondary" />
      )}
      {event.in_progress && (
        <View style={styles.sendingOuter}>
          <View style={styles.sendingInner}>
            <Loader size="xsmall" color="constantWhite" />
          </View>
        </View>
      )}
    </ListItemContent>
  );

  return (
    <List.Item
      subtitleNumberOfLines={subtitleNumberOfLines}
      valueStyle={valueStyle}
      onPress={handlePress}
      leftContent={icon}
      subvalue={subvalue}
      subtitle={subtitle}
      title={title}
      value={value}
    >
      {!event.is_scam && children}
      {isFailed && (
        <Text type="body2" color="accentOrange" style={styles.failedText.static}>
          {t('transactions.failed')}
        </Text>
      )}
    </List.Item>
  );
});

const styles = Steezy.create(({ colors }) => ({
  icon: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundContentTint,
  },
  receiveValue: {
    color: colors.accentGreen,
    textAlign: 'right',
  },
  amount: {
    textAlign: 'right',
    marginTop: -3,
    marginBottom: -1.5,
  },
  failedText: {
    marginTop: 8,
  },
  scamAmountText: {
    color: colors.textTertiary,
  },
  sendingOuter: {
    position: 'absolute',
    top: -6,
    left: -6,
    borderRadius: 18 + 2 / 2,

    borderWidth: 2,
    borderColor: colors.backgroundContent,
  },
  sendingInner: {
    borderRadius: 18 / 2,
    height: 18,
    width: 18,
    backgroundColor: colors.iconTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  picture: {
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
  },
}));
