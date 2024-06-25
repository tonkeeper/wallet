import { memo } from 'react';
import { Button, Modal, Spacer, Steezy, Table, Text, View } from '@tonkeeper/uikit';
import { navigation, SheetActions, useNavigation } from '@tonkeeper/router';
import { t } from '@tonkeeper/shared/i18n';
import { TokenApprovalStatus } from '@tonkeeper/mobile/src/wallet/managers/TokenApprovalManager';
import { delay } from '@tonkeeper/core';

export interface SuspiciousNFTDetailsModalProps {
  handleNewApproveStatus: (newStatus: TokenApprovalStatus) => () => void;
  isApprovedNow?: boolean;
}

export const SuspiciousNFTDetailsModal = memo<SuspiciousNFTDetailsModalProps>((props) => {
  const { goBack } = useNavigation();

  const handleUpdateStatus = (newStatus: TokenApprovalStatus) => async () => {
    goBack();
    await delay(500);
    props.handleNewApproveStatus(newStatus)();
  };

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content>
        <View style={styles.titleContainer}>
          <Text type="h2" textAlign="center">
            {t('suspiciousNFTDetails.title')}
          </Text>
          <Spacer y={4} />
          <Text color="textSecondary" type="body1" textAlign="center">
            {t('suspiciousNFTDetails.subtitle')}
          </Text>
        </View>
        <Spacer y={32} />
        <View style={styles.tableContainer}>
          <Table>
            <Table.Paragraph>{t('suspiciousNFTDetails.paragraphs.p1')}</Table.Paragraph>
            <Table.Paragraph>{t('suspiciousNFTDetails.paragraphs.p2')}</Table.Paragraph>
            <Table.Paragraph>{t('suspiciousNFTDetails.paragraphs.p3')}</Table.Paragraph>
          </Table>
          <Spacer y={32} />
          <Button
            onPress={handleUpdateStatus(TokenApprovalStatus.Spam)}
            color="orange"
            title={t('suspiciousNFTDetails.buttons.report')}
          />
          {!props.isApprovedNow && (
            <>
              <Spacer y={16} />
              <Button
                onPress={handleUpdateStatus(TokenApprovalStatus.Approved)}
                color="secondary"
                title={t('suspiciousNFTDetails.buttons.not_spam')}
              />
            </>
          )}
        </View>
        <Spacer y={16} />
      </Modal.Content>
      <Modal.Footer />
    </Modal>
  );
});

export function openSuspiciousNFTDetails(params: SuspiciousNFTDetailsModalProps) {
  navigation.push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: SuspiciousNFTDetailsModal,
    path: '/suspicious-nft',
    params,
  });
}

export const styles = Steezy.create({
  titleContainer: {
    paddingTop: 48,
    paddingHorizontal: 32,
  },
  tableContainer: {
    paddingHorizontal: 16,
  },
});
