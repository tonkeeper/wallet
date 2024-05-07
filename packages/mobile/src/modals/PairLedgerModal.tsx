import { useNavigation } from '@tonkeeper/router';
import { Button, Modal, Spacer, Steezy, View } from '@tonkeeper/uikit';
import { FC, useCallback } from 'react';
import { LedgerConnectionSteps } from '$components';
import { t } from '@tonkeeper/shared/i18n';

interface Props {}

export const PairLedgerModal: FC<Props> = () => {
  const nav = useNavigation();

  const handleContinue = useCallback(async () => {}, []);

  return (
    <Modal>
      <Modal.Header title={t('ledger.connect_title')} />
      <Modal.Content safeArea>
        <View style={styles.container}>
          <LedgerConnectionSteps currentStep="connect" />
        </View>
        <View style={styles.buttonsContainer}>
          <View style={styles.button}>
            <Button color="secondary" title={t('cancel')} />
          </View>
          <Spacer x={16} />
          <View style={styles.button}>
            <Button title={t('continue')} />
          </View>
        </View>
      </Modal.Content>
    </Modal>
  );
};

const styles = Steezy.create(({ colors }) => ({
  container: {
    marginHorizontal: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    padding: 16,
  },
  button: {
    flex: 1,
  },
}));
