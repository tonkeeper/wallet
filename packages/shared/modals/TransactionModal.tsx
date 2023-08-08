import { SheetActions, navigation, useNavigation } from '@tonkeeper/router';
import Clipboard from '@react-native-community/clipboard';
import { ActionTypeEnum } from '@tonkeeper/core/src/TonAPI';
import { memo, useCallback } from 'react';
import { tonkeeper } from '../tonkeeper';
import { config } from '../config';
import { formatTransactionDetailsTime } from '../utils/date';
import { t } from '../i18n';
import { formatter } from '../formatter';
import BigNumber from 'bignumber.js';
import { Address } from '@tonkeeper/core';
import {
  Icon,
  List,
  Modal,
  Pressable,
  Steezy,
  SText as Text,
  TonIcon,
  useTheme,
  View,
} from '@tonkeeper/uikit';
import { useTransaction } from '@tonkeeper/core/src/query/useTransaction';
import { EventActionDetailsMapper } from '../mappers/AccountEventsMapper';
import { EncryptedComment, EncryptedCommentLayout } from '../components';

type TransactionModalProps = {
  transaction: any;
};

export const TransactionModal = memo<TransactionModalProps>((props) => {
  const { transaction: tx } = props;
  const nav = useNavigation();

  const handlePressViewExplorer = useCallback(() => {
    nav.navigate('DAppBrowser', {
      url: config.get('transactionExplorer').replace('%s', tx.id),
    });
  }, []);

  // TODO: replace on useCopyText
  const copyText = useCallback((value: string) => {
    Clipboard.setString(value);
    // Toast.success(t('copied')); // TODO: Move toast to shared
  }, []);

  const time = formatTransactionDetailsTime(new Date(tx.timestamp * 1000));

  const fee = formatter.formatNano(tx.extra, {
    formatDecimals: 9,
    postfix: 'TON',
    absolute: true,
  });

  const isZeroExtra = new BigNumber(tx.extra).isLessThan(0);

  // const fiat = formatter.format(tokenPrice.fiat * parseFloat(amount), {
  //   currency: 'USD',
  //   currencySeparator: 'wide',
  // });

  const amount = formatter.formatNano(tx.action.data?.amount ?? 0, {
    // prefix: '-',
    formatDecimals: 9,
    withoutTruncate: true,
    postfix: 'TON',
  });

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content safeArea>
        <View style={styles.container}>
          <View style={styles.infoContainer}>
            {tx.action.type === ActionTypeEnum.TonTransfer && (
              <TonIcon size="large" style={styles.tonIcon} />
            )}
            <Text type="h2" style={styles.amountText}>
              {amount}
            </Text>
            <Text type="body1" color="textSecondary" style={styles.fiatText}></Text>
            <Text type="body1" color="textSecondary" style={styles.timeText}>
              {t(`transactionDetails.${tx.isReceive ? 'received_time' : 'sent_time'}`, {
                time,
              })}
            </Text>
          </View>
          <List>
            {tx.isReceive ? (
              <View>
                {tx.sender?.name && (
                  <List.Item
                    onPress={() => copyText(tx.sender.name)}
                    value={tx.sender.name}
                    label="Sender"
                  />
                )}
                {tx.sender && (
                  <List.Item
                    onPress={() => copyText(Address(tx.sender.address).toFriendly())}
                    label="Sender address"
                    subtitle={
                      <Text type="label1" numberOfLines={1} ellipsizeMode="middle">
                        {Address(tx.sender.address).toFriendly()}
                      </Text>
                    }
                  />
                )}
              </View>
            ) : (
              <View>
                {tx.recipient?.name && (
                  <List.Item
                    onPress={() => copyText(tx.recipient.name)}
                    value={tx.recipient.name}
                    label="Recipient"
                  />
                )}
                {tx.recipient && (
                  <List.Item
                    onPress={() => copyText(Address(tx.recipient.address).toFriendly())}
                    label="Recipient address"
                    subtitle={
                      <Text type="label1" numberOfLines={1} ellipsizeMode="middle">
                        {Address(tx.recipient.address).toFriendly()}
                      </Text>
                    }
                  />
                )}
              </View>
            )}
            <List.Item
              label={isZeroExtra ? t('transaction_fee') : t('transaction_refund')}
              onPress={() => copyText(fee)}
              value={fee}
              // subvalue={'$0.4'}
            />
            {transaction.encryptedComment && (
              <EncryptedComment
                transactionId={transaction.id}
                transactionType={transaction.type}
                encryptedComment={transaction.encryptedComment}
                sender={transaction.sender}
                layout={EncryptedCommentLayout.LIST_ITEM}
              />
            )}
            {transaction.comment && (
              <List.Item
                onPress={() => copyText(tx.comment)}
                label={'Comment'}
                value={tx.comment}
              />
            )}
          </List>
          <View style={styles.footer}>
            <Button onPress={handlePressViewExplorer} size="small" color="secondary">
              <Icon name="ic-globe-16" color="constantWhite" />
              <Text type="label2" style={{ marginLeft: 8 }}>
                Transaction
              </Text>
              <Text type="label2" color="textTertiary">
                {` ${tx.id.substring(0, 8)}`}
              </Text>
            </Button>
          </View>
        </View>
      </Modal.Content>
    </Modal>
  );
});

const styles = Steezy.create({
  container: {
    // padding: 16,
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
    // marginBottom: 16,
    alignSelf: 'center',
  },
  tonIcon: {
    marginBottom: 20,
  },
});

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
    const cachedTransaction = tonkeeper.transactions.getCachedById(txId);
    if (cachedTransaction) {
      openModal(cachedTransaction);
    } else {
      // Toast.loading();
      const transaction = await tonkeeper.transactions.fetchById(txId);
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
