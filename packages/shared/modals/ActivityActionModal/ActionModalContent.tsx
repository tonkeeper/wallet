import {
  Button,
  copyText,
  Icon,
  List,
  Steezy,
  SText as Text,
  View,
} from '@tonkeeper/uikit';
import { formatTransactionDetailsTime } from '../../utils/date';
import { ActionStatusEnum, JettonVerificationType } from '@tonkeeper/core/src/TonAPI';
import React, { memo, ReactNode, useCallback, useMemo } from 'react';
import { formatter } from '../../formatter';
import { config } from '@tonkeeper/mobile/src/config';
import { t } from '../../i18n';
import { useWalletCurrency } from '../../hooks';

// TODO: move to manager
import { useGetTokenPrice } from '@tonkeeper/mobile/src/hooks/useTokenPrice';

// TODO: move to shared
import { ExtraListItem } from './components/ExtraListItem';
import { Address } from '../../Address';
import { useHideableFormatter } from '@tonkeeper/mobile/src/core/HideableAmount/useHideableFormatter';
import {
  ActionAmountType,
  ActionType,
  AnyActionItem,
  isJettonTransferAction,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';
import { AmountFormatter } from '@tonkeeper/core';
import { openDAppBrowser } from '@tonkeeper/mobile/src/navigation';

interface ActionModalContentProps {
  children?: React.ReactNode;
  header?: React.ReactNode;
  title?: string;
  subtitle?: React.ReactNode;
  action: AnyActionItem;
  amountFiat?: string;
  label?: string;
  isSimplePreview?: boolean;
  shouldShowFiatAmount?: boolean;
  footerContent?: ReactNode;
}

export const ActionModalContent = memo<ActionModalContentProps>((props) => {
  const {
    children,
    header,
    title,
    subtitle,
    action,
    label,
    amountFiat,
    isSimplePreview,
    shouldShowFiatAmount = true,
    footerContent,
  } = props;
  const { formatNano, format } = useHideableFormatter();

  const isScam =
    action.event.is_scam ||
    (isJettonTransferAction(action) &&
      action.payload.jetton.verification === JettonVerificationType.Blacklist);

  const hash = ` ${action.event.event_id.substring(0, 8)}`;

  const handlePressHash = useCallback(() => {
    openDAppBrowser(
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

  const fiatCurrency = useWalletCurrency();
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
      const parsedAmount = parseFloat(
        formatter.fromNano(action.amount.value, action.amount.decimals),
      );
      return format(tokenPrice.fiat * parsedAmount, {
        currency: fiatCurrency,
        decimals: 9,
      });
    }
  }, [action.amount, getTokenPrice, fiatCurrency]);

  const titleText = title ?? amount;

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        {isScam ? (
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
          {subtitle}
          {(!subtitle || !shouldShowFiatAmount) &&
            fiatAmount &&
            action.status === ActionStatusEnum.Ok && (
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
      {footerContent ?? (
        <View style={styles.footer}>
          <Button onPress={handlePressHash} size="small" color="secondary">
            <Icon name="ic-globe-16" />
            <Text type="label2" style={styles.buttonText}>
              {t('transactionDetails.transaction')}
            </Text>
            <Text type="label2" color="textTertiary">
              {hash}
            </Text>
          </Button>
        </View>
      )}
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
