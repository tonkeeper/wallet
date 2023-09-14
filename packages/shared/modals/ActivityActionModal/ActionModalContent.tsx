import { SText as Text, Button, Icon, View, List, Steezy } from '@tonkeeper/uikit';
import { AmountFormatter, AnyActionItem } from '@tonkeeper/core';
import { formatTransactionDetailsTime } from '../../utils/date';
import { ActionStatusEnum } from '@tonkeeper/core/src/TonAPI';
import { useNavigation } from '@tonkeeper/router';
import { memo, useCallback, useMemo } from 'react';
import { formatter } from '../../formatter';
import { config } from '../../config';
import { t } from '../../i18n';

// TODO: move to manager
import { useTokenPrice } from '@tonkeeper/mobile/src/hooks/useTokenPrice';

// TODO: move to shared
import { fiatCurrencySelector } from '@tonkeeper/mobile/src/store/main';
import { useSelector } from 'react-redux';

interface ActionModalContentProps {
  children?: React.ReactNode;
  header?: React.ReactNode;
  action: AnyActionItem;
}

export const ActionModalContent = memo<ActionModalContentProps>((props) => {
  const { children, header, action } = props;
  const nav = useNavigation();

  const hash = ` ${action.event.event_id.substring(0, 8)}`;

  const handlePressHash = useCallback(() => {
    nav.navigate('DAppBrowser', {
      url: config.get('transactionExplorer').replace('%s', action.event.event_id),
    });
  }, [action.event.event_id]);

  const time = useMemo(() => {
    const time = formatTransactionDetailsTime(new Date(action.event.timestamp * 1000));
    let langKey: string | null = null;
    if (false) {
      // Some key
      // langKey = customLangKey;
    } else {
      if (action.destination === 'in') {
        langKey = 'received_date';
      } else if (action.destination === 'out') {
        langKey = 'sent_date';
      }
    }

    if (langKey) {
      return t(`transactionDetails.${langKey}`, { time });
    }

    return time;
  }, [action.event.timestamp, action.destination]);

  const fiatCurrency = useSelector(fiatCurrencySelector);
  const tokenPrice = useTokenPrice('ton'); //jettonAddress

  const amount = useMemo(() => {
    if (action.amount) {
      return formatter.formatNano(action.amount.value, {
        decimals: action.amount.decimals,
        postfix: action.amount.symbol,
        withoutTruncate: true,
        formatDecimals: 9,
        prefix:
          action.destination === 'in'
            ? AmountFormatter.sign.plus
            : AmountFormatter.sign.minus,
      });
    }
  }, [action.destination, action.amount]);

  const fiatAmount = useMemo(() => {
    if (action.amount && tokenPrice.fiat) {
      const parsedAmount = parseFloat(
        formatter.fromNano(action.amount.value, action.amount.decimals),
      );
      return formatter.format(tokenPrice.fiat * parsedAmount, {
        currency: fiatCurrency,
        decimals: 9,
      });
    }
  }, [action.amount, tokenPrice.fiat, fiatCurrency]);

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
          <View>{header}</View>
        )}
        <View style={styles.amountContainer}>
          {amount && (
            <Text type="h2" style={styles.amountText}>
              {amount}
            </Text>
          )}
          {fiatAmount && action.status === ActionStatusEnum.Ok && (
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
      <List>{children}</List>
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
}));
