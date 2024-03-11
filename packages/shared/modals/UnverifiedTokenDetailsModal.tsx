import { memo } from 'react';
import { Button, Modal, Spacer, Steezy, Table, Text, View } from '@tonkeeper/uikit';
import { navigation, SheetActions, useNavigation } from '@tonkeeper/router';
import { t } from '@tonkeeper/shared/i18n';

export const UnverifiedTokenDetailsModal = memo(() => {
  const { goBack } = useNavigation();

  return (
    <Modal>
      <Modal.Header />
      <Modal.Content>
        <View style={styles.titleContainer}>
          <Text type="h2" textAlign="center">
            {t('unverifiedTokenDetails.title')}
          </Text>
          <Spacer y={4} />
          <Text color="textSecondary" type="body1" textAlign="center">
            {t('unverifiedTokenDetails.description')}
          </Text>
        </View>
        <Spacer y={32} />
        <View style={styles.tableContainer}>
          <Table>
            <Table.Paragraph>{t('unverifiedTokenDetails.paragraphs.p1')}</Table.Paragraph>
            <Table.Paragraph>{t('unverifiedTokenDetails.paragraphs.p2')}</Table.Paragraph>
            <Table.Paragraph>{t('unverifiedTokenDetails.paragraphs.p3')}</Table.Paragraph>
            <Table.Paragraph>{t('unverifiedTokenDetails.paragraphs.p4')}</Table.Paragraph>
          </Table>
          <Spacer y={32} />
          <Button
            onPress={goBack}
            color="secondary"
            title={t('unverifiedTokenDetails.button')}
          />
        </View>
        <Spacer y={16} />
      </Modal.Content>
      <Modal.Footer />
    </Modal>
  );
});

export function openUnverifiedTokenDetailsModal() {
  navigation.push('SheetsProvider', {
    $$action: SheetActions.ADD,
    component: UnverifiedTokenDetailsModal,
    path: 'UnverifiedTokenDetailsModal',
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
