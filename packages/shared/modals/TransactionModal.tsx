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
import Clipboard from '@react-native-community/clipboard';
import React, { memo, useCallback } from 'react';
import { useTransaction } from '@tonkeeper/core/src/query/useTransaction';
import { EventActionDetailsMapper } from '../mappers/AccountEventsMapper';
import { useNavigation } from '@tonkeeper/router';
import { config } from '../config';
import { ActionTypeEnum } from '@tonkeeper/core/src/TonAPI';
import { EncryptedComment, EncryptedCommentLayout } from '../components';

type TransactionModalParams = {
  transactionId: string;
};

// export const TransactionModalController = createRouteController<TransactionModalParams>(
//   async (router, params) => {
//     try {
//       const cachedEvent = transactions.getCachedById(params.eventId);
//       if (cachedEvent) {
//         return router.pass(cachedEvent);
//       } else {
//         Toast.loading();
//         const event = await transactions.fetchById(params.eventId);
//         Toast.hide();

//         return router.pass(event);
//       }
//     } catch (err) {
//       Toast.fail('Message');
//     }
//   },
// );

interface TransactionModalProps {
  transactionId: string;
  walletAddress: string;
}

export const TransactionModal = memo<TransactionModalProps>((props) => {
  const { transactionId, walletAddress = '' } = props;
  const theme = useTheme();
  const nav = useNavigation();

  const transaction = useTransaction(transactionId, {
    modify: ({ event, action }) => {
      return EventActionDetailsMapper({
        event,
        action,
        walletAddress: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
      });
    },
  });

  const handlePressViewExplorer = useCallback(() => {
    nav.navigate('DAppBrowser', {
      url: config.get('transactionExplorer').replace('%s', transaction.id),
    });
  }, []);

  // TODO: replace on useCopyText
  const copyText = useCallback(
    (value: string) => () => {
      Clipboard.setString(value);
      // Toast.success(t('copied')); // TODO: Move toast to shared
    },
    [],
  );

  const Content = !!transaction.comment ? Modal.ScrollView : Modal.Content;

  return (
    <Modal>
      <Modal.Header />
      <Content safeArea>
        <View style={styles.container}>
          <View style={styles.infoContainer}>
            {transaction.type === ActionTypeEnum.TonTransfer && (
              <TonIcon size="large" style={styles.tonIcon} />
            )}
            <Text type="h2" style={styles.amountText}>
              {transaction.title}
            </Text>
            <Text type="body1" color="textSecondary" style={styles.fiatText}></Text>
            <Text type="body1" color="textSecondary" style={styles.timeText}>
              {transaction.time}
            </Text>
          </View>
          <List>
            {transaction.sender && (
              <List.Item
                onPress={copyText(transaction.sender.friendly)}
                value={transaction.sender.short}
                label="Sender"
              />
            )}
            <List.Item
              onPress={copyText(transaction.fee)}
              value={transaction.fee}
              subvalue={'$0.4'}
              label="Fee"
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
                onPress={copyText(transaction.comment)}
                label={'comment'}
                value={transaction.comment}
              />
            )}
          </List>
          <View style={styles.footer}>
            <Pressable
              underlayColor={theme.backgroundContentTint}
              backgroundColor={theme.buttonSecondaryBackground}
              onPress={handlePressViewExplorer}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 18,
                // backgroundColor: ,
              }}
            >
              <Icon name="ic-globe-16" color="constantWhite" />
              <Text type="label2" style={{ marginLeft: 8 }}>
                Transaction
              </Text>
              <Text type="label2" color="textTertiary">
                {' '}
                {transaction.id.substring(0, 8)}
              </Text>
            </Pressable>
            {/* <Button
              title={t('transaction_view_in_explorer')}
              onPress={handlePressViewExplorer}
              color="secondary"
            /> */}
          </View>
        </View>
      </Content>
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
    marginBottom: 16,
    alignSelf: 'center',
  },
  tonIcon: {
    marginBottom: 20,
  },
});
