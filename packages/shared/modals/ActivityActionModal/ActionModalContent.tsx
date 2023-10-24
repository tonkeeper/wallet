import {
  SText as Text,
  Button,
  Icon,
  View,
  List,
  Steezy,
  copyText,
} from '@tonkeeper/uikit';
import {
  ActionAmountType,
  ActionType,
  AmountFormatter,
  AnyActionItem,
} from '@tonkeeper/core';
import { formatTransactionDetailsTime } from '../../utils/date';
import { ActionStatusEnum } from '@tonkeeper/core/src/TonAPI';
import { memo, useCallback, useMemo } from 'react';
import { formatter } from '../../formatter';
import { config } from '../../config';
import { t } from '../../i18n';
import { useCurrency } from '../../hooks/useCurrency';
import { ExtraListItem } from './components/ExtraListItem';
import { Linking } from 'react-native';
import { Address } from '../../Address';

// TODO: move to manager
import { useGetTokenPrice } from '@tonkeeper/mobile/src/hooks/useTokenPrice';

// TODO: move to shared
import { useHideableFormatter } from '@tonkeeper/mobile/src/core/HideableAmount/useHideableFormatter';


interface ActionModalContentProps {
  children?: React.ReactNode;
  header?: React.ReactNode;
  title?: string;
  action: AnyActionItem;
  amountFiat?: string;
  label?: string;
  isSimplePreview?: boolean;
}

export const ActionModalContent = memo<ActionModalContentProps>((props) => {
  const { children, header, title, action, label, amountFiat, isSimplePreview } = props;
  const { formatNano, format } = useHideableFormatter();

  const hash = ` ${action.event.event_id.substring(0, 8)}`;

  const handlePressHash = useCallback(() => {
    Linking.openURL(
      config.get('transactionExplorer').replace('%s', action.event.event_id),
    );
  }, [action.event.event_id]);

  const time = useMemo(() => {
    const time = formatTransactionDetailsTime(new Date(action.event.timestamp * 1000));
    let labelTime: string | undefined;
    if (label) {
      labelTime = label;
    } else {
      if (action.type === ActionType.WithdrawStakeRequest) {
        labelTime = undefined;
      } else if (action.destination === 'in') {
        labelTime = t('activityActionModal.received');
      } else if (action.destination === 'out') {
        labelTime = t('activityActionModal.sent');
      }
    }

    if (labelTime) {
      return labelTime + ' ' + t(`activityActionModal.time_on`, { time });
    }

    return time;
  }, [action.event.timestamp, action.destination, label]);

  const currency = useCurrency();
  const getTokenPrice = useGetTokenPrice();

  const amount = useMemo(() => {
    if (action.amount) {
      return formatNano(action.amount.value, {
        decimals: action.amount.decimals,
        postfix: action.amount.symbol,
        withoutTruncate: true,
        formatDecimals: 9,
        prefix:
          action.destination === 'in'
            ? AmountFormatter.sign.plus
            : AmountFormatter.sign.minus,
      });
    } else if (!!action.simple_preview.value) {
      return action.simple_preview.value;
    }
  }, [action.destination, action.amount, action.simple_preview]);

  const fiatAmount = useMemo(() => {
    if (amountFiat !== undefined) {
      return amountFiat;
    } else if (action.amount) {
      const tokenPrice =
        action.amount.type === ActionAmountType.Jetton
          ? getTokenPrice(Address.parse(action.amount.jettonAddress).toFriendly())
          : getTokenPrice('ton');
      if (tokenPrice.fiat) {
        const parsedAmount = parseFloat(
          formatter.fromNano(action.amount.value, action.amount.decimals),
        );
        return format(tokenPrice.fiat * parsedAmount, {
          decimals: 9,
          currency,
        });
      }
    }
  }, [action.amount, getTokenPrice, currency]);

  const titleText = title ?? amount;

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        {action.event.is_scam ? (
          <View style={styles.scam}>
            <Text type="label2" color="constantWhite">
              {t('transactionDetails.spam')}
            </Text>
          </View>
        ) : (
          <View style={!!titleText && !!header && styles.headerIndentButtom}>
            {header}
          </View>
        )}
        <View style={styles.amountContainer}>
          {titleText && (
            <Text type="h2" style={styles.amountText}>
              {titleText}
            </Text>
          )}
          {!title && fiatAmount && action.status === ActionStatusEnum.Ok && (
            <Text type="body1" color="textSecondary" style={styles.fiatText}>
              {fiatAmount}
            </Text>
          )}
        </View>
        <Text type="body1" color="textSecondary" style={styles.timeText}>
          {time}
        </Text>
        {action.status === ActionStatusEnum.Failed && (
          <Text type="body1" color="accentOrange">
            {t('transactions.failed')}
          </Text>
        )}
      </View>
      {children ? (
        children
      ) : (
        <List>
          {isSimplePreview && (
            <>
              <List.Item
                onPress={copyText(action.simple_preview.name)}
                value={action.simple_preview.name}
                title={t('transactionDetails.operation')}
                titleType="secondary"
              />
              <List.Separator />
              <List.Item
                onPress={copyText(action.simple_preview.description)}
                value={action.simple_preview.description}
                title={t('transactionDetails.description')}
                titleType="secondary"
                valueMultiline
              />
            </>
          )}
          <ExtraListItem extra={action.event.extra} />
        </List>
      )}
      <View style={styles.footer}>
        <Button onPress={handlePressHash} size="small" color="secondary">
          <Icon name="ic-globe-16" color="constantWhite" />
          <Text type="label2" style={styles.buttonText}>
            {t('transactionDetails.transaction')}
          </Text>
          <Text type="label2" color="textTertiary">
            {hash}
          </Text>
        </Button>
      </View>
    </View>
  );
});

const styles = Steezy.create(({ colors, corners }) => ({
  container: {
    paddingTop: 48,
  },
  footer: {
    padding: 16,
    marginBottom: 16,
    alignSelf: 'center',
  },
  buttonText: {
    marginLeft: 8,
  },
  info: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  timeText: {
    marginTop: 4,
  },
  amountContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountText: {
    textAlign: 'center',
  },
  fiatText: {
    marginTop: 4,
  },
  scam: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 12,
    backgroundColor: colors.accentOrange,
    borderRadius: corners.extraSmall,
  },
  headerIndentButtom: {
    marginBottom: 20,
  },
}));
