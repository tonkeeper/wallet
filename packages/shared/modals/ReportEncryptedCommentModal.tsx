import { memo, useCallback } from 'react';
import { Button, Modal, Spacer, Text, Toast, View } from '@tonkeeper/uikit';
import { Steezy } from '@tonkeeper/uikit';
import { navigation, SheetActions, useNavigation } from '@tonkeeper/router';
import { t } from '../i18n';
import { useWallet } from '../hooks';

export interface ReportEncryptedCommentModalProps {
  decrypted_comment: string;
  tx_hash: string;
}

export const ReportEncryptedCommentModal = memo<ReportEncryptedCommentModalProps>(
  (props) => {
    const wallet = useWallet();
    const nav = useNavigation();

    const handleReport = useCallback(() => {
      nav.goBack();
      Toast.success(t('suspicious.status_update.spam.transaction'));

      console.log(props.tx_hash, props.decrypted_comment);
      wallet.localScam.add(props.tx_hash, props.decrypted_comment);
    }, [nav, wallet, props.tx_hash, props.decrypted_comment]);

    return (
      <Modal alternateBackground>
        <Modal.Header />
        <Modal.Content>
          <View style={styles.wrap}>
            <Text textAlign="center" type="h2">
              {t('suspicious.report_transaction.title')}
            </Text>
            <Spacer y={4} />
            <Text textAlign="center" color="textSecondary" type="body1">
              {t('suspicious.report_transaction.description')}
            </Text>
          </View>
          <Spacer y={32} />
          <View style={styles.buttonContainer}>
            <Button
              onPress={handleReport}
              size="large"
              title={t('suspicious.report_transaction.button')}
              color="secondary"
            />
          </View>
        </Modal.Content>
        <Modal.Footer alternateBackground>
          <Spacer y={16} />
        </Modal.Footer>
      </Modal>
    );
  },
);

export function openReportEncryptedCommentModal(
  tx_hash: string,
  decrypted_comment: string,
) {
  navigation.push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: ReportEncryptedCommentModal,
    params: { decrypted_comment, tx_hash },
    path: 'ReportEncryptedCommentModal',
  });
}

const styles = Steezy.create({
  wrap: {
    paddingTop: 48,
    alignItems: 'center',
    paddingHorizontal: 32,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 16,
  },
});
