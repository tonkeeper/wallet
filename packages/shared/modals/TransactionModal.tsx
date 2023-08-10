import { EncryptedComment, EncryptedCommentLayout } from '../components/EncryptedComment';
import { SheetActions, navigation, useNavigation } from '@tonkeeper/router';
import { formatTransactionDetailsTime } from '../utils/date';
import { Fragment, memo, useCallback, useMemo } from 'react';
import { Address } from '@tonkeeper/core';
import { formatter } from '../formatter';
import { config } from '../config';
import { tk } from '../tonkeeper';
import { t } from '../i18n';
import {
  SText as Text,
  TonIcon,
  Button,
  Steezy,
  Icon,
  List,
  Modal,
  View,
} from '@tonkeeper/uikit';

import {
  Transaction,
  TxActionEnum,
} from '@tonkeeper/core/src/managers/TransactionsManager';

import Clipboard from '@react-native-community/clipboard';
import { useTokenPrice } from '@tonkeeper/mobile/src/hooks/useTokenPrice';
import { fiatCurrencySelector } from '@tonkeeper/mobile/src/store/main';
import { useSelector } from 'react-redux';

type TransactionModalProps = {
  transaction: Transaction;
};

export const TransactionModal = memo<TransactionModalProps>((props) => {
  const { transaction: tx } = props;
  const fiatCurrency = useSelector(fiatCurrencySelector);
  const tokenPrice = useTokenPrice('ton');
  const nav = useNavigation();

  const handlePressHash = useCallback(() => {
    nav.navigate('DAppBrowser', {
      url: config.get('transactionExplorer').replace('%s', tx.hash),
    });
  }, [tx.hash]);

  // TODO: replace on useCopyText
  const copyText = useCallback((value?: string) => {
    if (value) {
      Clipboard.setString(value);
      // Toast.success(t('copied')); // TODO: Move toast to shared
    }
  }, []);

  const fee = useMemo(() => {
    if (tx.extra) {
      const extra = formatter.fromNano(tx.extra ?? 0, 9);
      const fiatAmount = tokenPrice.fiat * parseFloat(extra);

      return {
        isNegative: formatter.isNegative(extra),
        value: formatter.format(extra, {
          postfix: 'TON',
          absolute: true,
          decimals: 9,
        }),
        fiat: formatter.format(fiatAmount, {
          currencySeparator: 'wide',
          currency: fiatCurrency,
          absolute: true,
          decimals: 9,
        }),
      };
    }
  }, [tx.extra, tokenPrice.fiat]);

  const amount = useMemo(() => {
    if (tx.action.amount) {
      return formatter.formatNano(tx.action.amount.value, {
        formatDecimals: tx.action.amount.decimals ?? 9,
        prefix: tx.destination === 'in' ? '+' : '-',
        postfix: tx.action.amount.tokenName,
        withoutTruncate: true,
      });
    }
  }, [tx.destination, tx.action.amount]);

  const fiatAmount = useMemo(() => {
    if (tx.action.amount && !tx.action.amount.tokenAddress) {
      const amount = parseFloat(formatter.fromNano(tx.action.amount.value));
      return formatter.format(tokenPrice.fiat * amount, {
        currency: fiatCurrency,
      });
    }
  }, [tx.action.amount, tokenPrice.fiat]);

  const formattedTime = useMemo(() => {
    const time = formatTransactionDetailsTime(new Date(tx.timestamp * 1000));
    let timeLangKey: string | null = null;
    if (tx.destination === 'in') {
      timeLangKey = 'received_time';
    } else if (tx.destination === 'out') {
      timeLangKey = 'sent_time';
    }

    if (timeLangKey) {
      return t(`transactionDetails.${timeLangKey}`, { time });
    }

    return time;
  }, [tx.timestamp]);

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content safeArea>
        <View style={styles.container}>
          <View style={styles.infoContainer}>
            {tx.is_scam ? (
              <View style={styles.spam}>
                <Text type="label2" color="constantWhite">
                  {t('transactionDetails.spam')}
                </Text>
              </View>
            ) : (
              <View>
                {tx.action.type === TxActionEnum.TonTransfer && (
                  <TonIcon size="large" style={styles.tonIcon} />
                )}
              </View>
            )}
            {amount && (
              <Text type="h2" style={styles.amountText}>
                {amount}
              </Text>
            )}
            {fiatAmount && (
              <Text type="body1" color="textSecondary" style={styles.fiatText}>
                {fiatAmount}
              </Text>
            )}
            <Text type="body1" color="textSecondary" style={styles.timeText}>
              {formattedTime}
            </Text>
          </View>
          <List>
            {tx.destination === 'in' ? (
              <Fragment>
                {!!tx.action.sender.name && (
                  <List.Item
                    onPress={() => copyText(tx.action.sender.name)}
                    value={tx.action.sender.name}
                    titleType="secondary"
                    title={t('transactionDetails.sender')}
                  />
                )}
                {tx.action.sender && (
                  <List.Item
                    onPress={() =>
                      copyText(Address(tx.action.sender.address).toFriendly())
                    }
                    titleType="secondary"
                    title={t('transactionDetails.sender_address')}
                    subtitle={
                      <Text type="label1" numberOfLines={1} ellipsizeMode="middle">
                        {Address(tx.action.sender.address).toFriendly()}
                      </Text>
                    }
                  />
                )}
              </Fragment>
            ) : tx.destination === 'out' ? (
              <Fragment>
                {!!tx.action.recipient?.name && (
                  <List.Item
                    onPress={() => copyText(tx.action.recipient.name)}
                    value={tx.action.recipient.name}
                    titleType="secondary"
                    title={t('transactionDetails.recipient')}
                  />
                )}
                {!!tx.action.recipient && (
                  <List.Item
                    onPress={() =>
                      copyText(Address(tx.action.recipient.address).toFriendly())
                    }
                    titleType="secondary"
                    title={t('transactionDetails.recipient_address')}
                    subtitle={
                      <Text type="label1" numberOfLines={1} ellipsizeMode="middle">
                        {Address(tx.action.recipient.address).toFriendly()}
                      </Text>
                    }
                  />
                )}
              </Fragment>
            ) : null}
            {fee && (
              <List.Item
                titleType="secondary"
                title={fee?.isNegative ? t('transaction_fee') : t('transaction_refund')}
                onPress={() => copyText(fee.value)}
                value={fee.value}
                subvalue={fee.fiat}
              />
            )}
            {tx.action.encrypted_comment && (
              <EncryptedComment
                layout={EncryptedCommentLayout.LIST_ITEM}
                encryptedComment={tx.action.encrypted_comment}
                transactionType={tx.action.type}
                transactionId={tx.hash}
                sender={tx.sender!}
              />
            )}
            {!!tx.action.comment && (
              <List.Item
                onPress={() => copyText(tx.comment)}
                titleType="secondary"
                title={t('transactionDetails.comment')}
                value={tx.action.comment}
              />
            )}
          </List>
          <View style={styles.footer}>
            <Button onPress={handlePressHash} size="small" color="secondary">
              <Icon name="ic-globe-16" color="constantWhite" />
              <Text type="label2" style={{ marginLeft: 8 }}>
                {t('transactionDetails.transaction')}
              </Text>
              <Text type="label2" color="textTertiary">
                {` ${tx.hash.substring(0, 8)}`}
              </Text>
            </Button>
          </View>
        </View>
      </Modal.Content>
    </Modal>
  );
});

const styles = Steezy.create(({ colors, corners }) => ({
  container: {
    paddingTop: 48,
  },
  infoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  amountText: {
    textAlign: 'center',
  },
  fiatText: {
    marginTop: 4,
  },
  timeText: {
    marginTop: 4,
  },
  footer: {
    padding: 16,
    marginBottom: 16,
    alignSelf: 'center',
  },
  tonIcon: {
    marginBottom: 20,
  },
  spam: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 12,
    backgroundColor: colors.accentOrange,
    borderRadius: corners.extraSmall,
  },
}));

export async function openTransactionDetails(txId: string) {
  const openModal = (transaction: any) => {
    navigation.push('SheetsProvider', {
      $$action: SheetActions.ADD,
      component: TransactionModal,
      params: { transaction },
      path: 'TRANSACTION_DETAILS',
    });
  };

  try {
    const cachedTransaction = tk.wallet.transactions.getCachedById(txId);
    if (cachedTransaction) {
      openModal(cachedTransaction);
    } else {
      // Toast.loading();
      const transaction = await tk.wallet.transactions.fetchById(txId);
      if (transaction) {
        openModal(transaction);
      }
      // Toast.hide();
    }
  } catch (err) {
    console.log(err);
    // Toast.fail('Message');
  }
}
