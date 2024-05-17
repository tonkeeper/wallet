import { openActivityActionModal } from '../../modals/ActivityActionModal';
import { ActionStatusEnum, JettonVerificationType } from '@tonkeeper/core/src/TonAPI';
import {
  Icon,
  IconNames,
  List,
  ListItemContent,
  ListItemContentText,
  Loader,
  Picture,
  Steezy,
  Text,
  View,
} from '@tonkeeper/uikit';
import { formatTransactionTime } from '../../utils/date';
import { findSenderAccount } from './findSenderAccount';
import { memo, useCallback, useMemo } from 'react';
import { ImageRequireSource } from 'react-native';
import { Address } from '../../Address';
import { t } from '../../i18n';

import { useHideableFormatter } from '@tonkeeper/mobile/src/core/HideableAmount/useHideableFormatter';
import { useFlags } from '@tonkeeper/mobile/src/utils/flags';
import { config } from '@tonkeeper/mobile/src/config';
import { AmountFormatter } from '@tonkeeper/core';
import {
  ActionType,
  AnyActionItem,
  isJettonTransferAction,
  ActionSource,
} from '@tonkeeper/mobile/src/wallet/models/ActivityModel';

export interface ActionListItemProps<TActionType extends ActionType = ActionType> {
  onPress?: () => void;
  subvalue?: string | React.ReactNode;
  action: AnyActionItem<TActionType>;
  subtitleNumberOfLines?: number;
  children?: React.ReactNode;
  pictureSource?: ImageRequireSource;
  pictureUri?: string;
  iconName?: IconNames;
  leftContent?: React.ReactNode;
  title?: string;
  value?: string;
  subtitle?: string;
  greenValue?: boolean;
  ignoreFailed?: boolean;
  disablePressable?: boolean;
  disableNftPreview?: boolean;
  isSimplePreview?: boolean;
}

export const PureActionListItem = memo<ActionListItemProps>((props) => {
  const {
    action,
    children,
    onPress,
    subtitleNumberOfLines,
    greenValue,
    ignoreFailed,
    disablePressable,
    isSimplePreview,
  } = props;
  const { formatNano } = useHideableFormatter();

  const isScam =
    action.event.is_scam ||
    (isJettonTransferAction(action) &&
      action.payload.jetton.verification === JettonVerificationType.Blacklist);

  const flags = useFlags(['address_style_nobounce']);

  const bounceable =
    action.initialActionType === ActionType.SmartContractExec ||
    !flags.address_style_nobounce;

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      openActivityActionModal(action.action_id, ActionSource.Ton);
    }
  }, [onPress]);

  const isFailed = action.status === ActionStatusEnum.Failed;

  const senderAccount = useMemo(() => {
    return findSenderAccount(action);
  }, [action]);

  const picture = useMemo(() => {
    if (props.pictureUri !== undefined) {
      return { uri: props.pictureUri };
    } else if (props.pictureSource !== undefined) {
      return { source: props.pictureSource };
    } else if (senderAccount?.icon) {
      return { uri: senderAccount.icon };
    } else if (action.simple_preview.action_image) {
      return { uri: action.simple_preview.action_image };
    } else {
      return null;
    }
  }, [props.pictureSource, props.pictureUri, senderAccount, action.simple_preview]);

  const iconName = useMemo(() => {
    if (isFailed) {
      return 'ic-exclamationmark-circle-28';
    } else if (props.iconName !== undefined) {
      return props.iconName;
    } else if (action.destination === 'in') {
      return 'ic-tray-arrow-down-28';
    } else if (action.destination === 'out') {
      return 'ic-tray-arrow-up-28';
    } else {
      return 'ic-gear-28';
    }
  }, [props.iconName, action, isFailed]);

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
    if (isScam) {
      return t('transactions.spam');
    } else if (props.subtitle !== undefined) {
      return props.subtitle;
    } else if (senderAccount) {
      if (senderAccount.name) {
        return senderAccount.name;
      } else {
        return Address.parse(senderAccount.address, {
          bounceable: !senderAccount.is_wallet,
        }).toShort();
      }
    } else {
      const account = action.simple_preview.accounts[0];
      return account
        ? Address.parse(account.address, { bounceable: !account.is_wallet }).toShort()
        : '-';
    }
  }, [action.simple_preview, isScam, senderAccount, props.subtitle, bounceable]);

  const value = useMemo(() => {
    if (props.value !== undefined) {
      return props.value;
    } else {
      let amountPrefix = AmountFormatter.sign.minus;
      if (action.type === ActionType.WithdrawStakeRequest) {
        amountPrefix = '';
      } else if (action.destination === 'out') {
        amountPrefix = AmountFormatter.sign.minus;
      } else if (action.destination === 'in') {
        amountPrefix = AmountFormatter.sign.plus;
      }

      if (action.amount) {
        return formatNano(action.amount.value, {
          decimals: action.amount.decimals,
          postfix: action.amount.symbol,
          prefix: amountPrefix,
        });
      }

      return action.simple_preview.value ?? AmountFormatter.sign.minus;
    }
  }, [action.destination, action.amount, action.simple_preview, props.value, formatNano]);

  const subvalue = useMemo(() => {
    if (props.subvalue !== undefined) {
      return props.subvalue;
    } else {
      return formatTransactionTime(new Date(action.event.timestamp * 1000));
    }
  }, [action.event.timestamp, props.subvalue]);

  const valueStyle = [
    (action.destination === 'in' || greenValue) && styles.receiveValue,
    isScam && styles.scamAmountText,
    action.type === ActionType.WithdrawStakeRequest && styles.withdrawalRequest,
  ];

  const leftContent = (
    <ListItemContent style={styles.icon.static}>
      {picture && !isFailed ? (
        <Picture style={styles.picture} uri={picture.uri} source={picture.source} />
      ) : (
        <Icon name={iconName} color="iconSecondary" />
      )}
      {action.event.in_progress && (
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
      onPress={!disablePressable ? handlePress : undefined}
      leftContent={props.leftContent ?? leftContent}
      subtitleNumberOfLines={subtitleNumberOfLines}
      valueStyle={valueStyle}
      subvalue={subvalue}
      subtitle={subtitle}
      title={title}
      value={value}
    >
      {!isScam && children}
      {isSimplePreview && !!action.simple_preview.description && (
        <ListItemContentText text={action.simple_preview.description} />
      )}
      {!config.get('disable_show_unverified_token') &&
        isJettonTransferAction(action) &&
        action.payload.jetton.verification === JettonVerificationType.None && (
          <Text type="body2" color="accentOrange" style={styles.warn.static}>
            {t('approval.unverified_token')}
          </Text>
        )}
      {isFailed && !ignoreFailed && (
        <Text type="body3" color="accentOrange" style={styles.warn.static}>
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
  warn: {
    marginTop: 8,
  },
  scamAmountText: {
    color: colors.textTertiary,
  },
  withdrawalRequest: {
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
